import prisma from "@/lib/db";

export interface CalculateOrderPricingParams {
  restaurantId: string;
  items: { menuItemId: string; quantity: number }[];
  couponCode?: string;
  userId?: string;
}

export interface PricingBreakdown {
  items: {
    menuItemId: string;
    name: string;
    pricePaise: number;
    quantity: number;
    itemTotalPaise: number;
  }[];
  subtotalPaise: number;
  taxPaise: number; // 5% GST
  deliveryFeePaise: number;
  platformFeePaise: number;
  discountPaise: number;
  appliedCoupon?: {
    code: string;
    discountPaise: number;
    description: string;
  } | null;
  totalPaise: number;
}

/**
 * Server-side authoritative pricing computation in integer paise.
 */
export async function calculateOrderPricing({
  restaurantId,
  items,
  couponCode,
  userId,
}: CalculateOrderPricingParams): Promise<PricingBreakdown> {
  if (!items || items.length === 0) {
    throw new Error("Cannot calculate pricing for empty cart");
  }

  // Fetch verified menu items from the database
  const menuItemIds = items.map((i) => i.menuItemId);
  const dbMenuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: menuItemIds },
      restaurantId: restaurantId,
    },
  });

  if (dbMenuItems.length !== menuItemIds.length) {
    throw new Error("One or more items are invalid or belong to a different restaurant");
  }

  // Calculate subtotal
  let subtotalPaise = 0;
  const itemSnapshots = items.map((item) => {
    const dbItem = dbMenuItems.find((m) => m.id === item.menuItemId);
    if (!dbItem) throw new Error(`Item ${item.menuItemId} not found`);
    if (!dbItem.isAvailable) throw new Error(`Item ${dbItem.name} is currently out of stock`);
    if (item.quantity <= 0 || item.quantity > 50) {
      throw new Error(`Invalid quantity for ${dbItem.name}`);
    }

    const itemTotalPaise = dbItem.pricePaise * item.quantity;
    subtotalPaise += itemTotalPaise;

    return {
      menuItemId: dbItem.id,
      name: dbItem.name,
      pricePaise: dbItem.pricePaise,
      quantity: item.quantity,
      itemTotalPaise,
    };
  });

  // Calculate 5% GST (integer paise rounding)
  const taxPaise = Math.round(subtotalPaise * 0.05);

  // Standard delivery & platform charges
  const deliveryFeePaise = 4000; // ₹40.00
  const platformFeePaise = 1000; // ₹10.00

  // Calculate Coupon Discount
  let discountPaise = 0;
  let appliedCoupon: PricingBreakdown["appliedCoupon"] = null;

  if (couponCode && couponCode.trim()) {
    const code = couponCode.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    const now = new Date();
    if (
      coupon &&
      coupon.isActive &&
      now >= coupon.validFrom &&
      now <= coupon.validTo &&
      coupon.timesUsed < coupon.usageLimit
    ) {
      // Check user redemption limit if userId provided
      let userRedemptionCount = 0;
      if (userId) {
        userRedemptionCount = await prisma.couponRedemption.count({
          where: { couponId: coupon.id, userId },
        });
      }

      if (userRedemptionCount < coupon.perUserLimit && subtotalPaise >= coupon.minOrderPaise) {
        if (coupon.discountType === "PERCENTAGE") {
          let calculated = Math.round((subtotalPaise * coupon.discountValue) / 100);
          if (coupon.maxDiscountPaise && calculated > coupon.maxDiscountPaise) {
            calculated = coupon.maxDiscountPaise;
          }
          discountPaise = calculated;
        } else if (coupon.discountType === "FIXED") {
          discountPaise = Math.min(coupon.discountValue, subtotalPaise);
        }

        appliedCoupon = {
          code: coupon.code,
          discountPaise,
          description: coupon.description,
        };
      }
    }
  }

  // Final Total calculation
  const totalPaise = Math.max(
    0,
    subtotalPaise + taxPaise + deliveryFeePaise + platformFeePaise - discountPaise
  );

  return {
    items: itemSnapshots,
    subtotalPaise,
    taxPaise,
    deliveryFeePaise,
    platformFeePaise,
    discountPaise,
    appliedCoupon,
    totalPaise,
  };
}
