import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user.role !== "RESTAURANT_STAFF" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const staff = await prisma.restaurantStaff.findFirst({
      where: { userId: user.id },
    });
    const restaurantId = staff?.restaurantId || "rest_royal_spice";

    const body = await req.json();
    const { isOpen } = body;

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { isOpen: Boolean(isOpen) },
    });

    return NextResponse.json({ success: true, restaurant: updated });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
