import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }
    const { id } = await context.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        restaurant: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            imageUrl: true,
            latitude: true,
            longitude: true,
            fssaiLicense: true,
          },
        },
        rider: {
          select: {
            id: true,
            name: true,
            phone: true,
            riderProfile: {
              select: {
                vehicleType: true,
                licenseNumber: true,
                currentLatitude: true,
                currentLongitude: true,
                lastPingAt: true,
              },
            },
          },
        },
        items: true,
        statusHistory: { orderBy: { createdAt: "asc" } },
        payments: true,
        review: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Role-based authorization check
    const isOwnerCustomer = user.id === order.customerId;
    const isAssignedRider = user.id === order.riderId;
    const isStaff = user.role === "RESTAURANT_STAFF" && user.restaurantId === order.restaurantId;
    const isAdmin = user.role === "ADMIN";

    if (!isOwnerCustomer && !isAssignedRider && !isStaff && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // Hide OTP from restaurant staff and delivery rider! Delivery rider must receive OTP directly from customer at doorstep.
    const isAuthorizedForOtp = isOwnerCustomer || isAdmin;
    const sanitizedOrder = {
      ...order,
      deliveryOtp: isAuthorizedForOtp ? order.deliveryOtpHash : undefined,
      deliveryOtpHash: undefined, // Never expose raw database hash directly
    };

    return NextResponse.json({ order: sanitizedOrder });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
