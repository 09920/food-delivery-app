import { NextRequest, NextResponse } from "next/server";
import { calculateOrderPricing } from "@/modules/cart/pricing";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { restaurantId, items, couponCode } = body;

    if (!restaurantId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid request: restaurantId and items are required" },
        { status: 400 }
      );
    }

    const pricing = await calculateOrderPricing({
      restaurantId,
      items,
      couponCode,
      userId: user?.id,
    });

    return NextResponse.json({ pricing });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
