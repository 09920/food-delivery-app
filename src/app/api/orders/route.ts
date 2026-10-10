import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { calculateOrderPricing } from "@/modules/cart/pricing";
import { createRazorpayOrder } from "@/modules/payments/razorpay";
import { generateDeliveryOtp, assignRiderToOrder } from "@/modules/delivery/assignment";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const searchParams = req.nextUrl.searchParams;
    const filterRole = searchParams.get("role") || user.role;

    let orders;

    if (filterRole === "ADMIN") {
      orders = await prisma.order.findMany({
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          restaurant: { select: { id: true, name: true, phone: true } },
          rider: { select: { id: true, name: true, phone: true } },
          items: true,
          payments: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    } else if (filterRole === "RESTAURANT_STAFF") {
      const staffRecord = await prisma.restaurantStaff.findFirst({
        where: { userId: user.id },
      });
      const restaurantId = staffRecord?.restaurantId || "rest_royal_spice";

      orders = await prisma.order.findMany({
        where: { restaurantId },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          rider: { select: { id: true, name: true, phone: true } },
          items: true,
          statusHistory: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (filterRole === "RIDER") {
      orders = await prisma.order.findMany({
        where: { riderId: user.id },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          restaurant: { select: { id: true, name: true, phone: true, address: true } },
          items: true,
          statusHistory: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // CUSTOMER orders
      orders = await prisma.order.findMany({
        where: { customerId: user.id },
        include: {
          restaurant: { select: { id: true, name: true, imageUrl: true, phone: true } },
          rider: { select: { id: true, name: true, phone: true } },
          items: true,
          review: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await req.json();

    const {
      restaurantId,
      items,
      addressId,
      couponCode,
      idempotencyKey,
    } = body;

    if (!restaurantId || !items || !items.length || !addressId) {
      return NextResponse.json(
        { error: "Missing required order parameters" },
        { status: 400 }
      );
    }

    // 1. Validate Restaurant existence and open status
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    if (!restaurant.isOpen) {
      return NextResponse.json(
        { error: "Restaurant is currently closed and not accepting orders" },
        { status: 400 }
      );
    }

    // 2. Fetch Customer Address
    const address = await prisma.customerAddress.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return NextResponse.json({ error: "Delivery address not found" }, { status: 404 });
    }

    // 3. Authoritative Pricing Calculation
    const pricing = await calculateOrderPricing({
      restaurantId,
      items,
      couponCode,
      userId: user.id,
    });

    // 4. Generate 4-digit Delivery OTP
    const deliveryOtp = generateDeliveryOtp();
    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    // 5. Create Order Transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: user.id,
          restaurantId,
          status: "PLACED",
          subtotalPaise: pricing.subtotalPaise,
          taxPaise: pricing.taxPaise,
          deliveryFeePaise: pricing.deliveryFeePaise,
          platformFeePaise: pricing.platformFeePaise,
          discountPaise: pricing.discountPaise,
          totalPaise: pricing.totalPaise,
          deliveryAddressSnapshot: JSON.stringify({
            label: address.label,
            addressLine: address.addressLine,
            landmark: address.landmark,
            city: address.city,
            pincode: address.pincode,
            latitude: address.latitude,
            longitude: address.longitude,
          }),
          restaurantSnapshot: JSON.stringify({
            name: restaurant.name,
            phone: restaurant.phone,
            address: restaurant.address,
            fssaiLicense: restaurant.fssaiLicense,
          }),
          deliveryOtpHash: deliveryOtp,
          deliveryOtpExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
          estimatedDeliveryMinutes: restaurant.averagePreparationMinutes + 15,
          restaurantAcceptDeadline: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          items: {
            create: pricing.items.map((i) => ({
              menuItemId: i.menuItemId,
              nameSnapshot: i.name,
              pricePaiseSnapshot: i.pricePaise,
              quantity: i.quantity,
              totalPaise: i.itemTotalPaise,
            })),
          },
          statusHistory: {
            create: {
              previousStatus: null,
              newStatus: "PLACED",
              actorId: user.id,
              actorRole: user.role,
              reason: "Order successfully placed by customer",
            },
          },
        },
      });

      // Track coupon redemption if applicable
      if (pricing.appliedCoupon) {
        const coupon = await tx.coupon.findUnique({
          where: { code: pricing.appliedCoupon.code },
        });
        if (coupon) {
          await tx.couponRedemption.create({
            data: {
              couponId: coupon.id,
              userId: user.id,
              orderId: order.id,
              discountPaise: pricing.discountPaise,
            },
          });
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { timesUsed: { increment: 1 } },
          });
        }
      }

      return order;
    });

    // 6. Initiate Razorpay Payment Order
    const paymentResult = await createRazorpayOrder(
      newOrder.id,
      newOrder.totalPaise,
      idempotencyKey || `idem_${newOrder.id}_${Date.now()}`
    );

    // 7. Auto-assign nearby rider in background
    assignRiderToOrder(newOrder.id).catch(console.error);

    return NextResponse.json({
      order: newOrder,
      payment: paymentResult,
      otp: deliveryOtp, // Returned to customer for verification display
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
