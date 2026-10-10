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
    const { categoryId, name, description, pricePaise, isVegetarian, imageUrl, preparationMinutes } = body;

    const item = await prisma.menuItem.create({
      data: {
        restaurantId,
        categoryId,
        name,
        description,
        pricePaise: Number(pricePaise),
        isVegetarian: Boolean(isVegetarian),
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
        preparationMinutes: Number(preparationMinutes || 20),
        isAvailable: true,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user.role !== "RESTAURANT_STAFF" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { itemId, isAvailable, pricePaise, name, description } = body;

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const updated = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        ...(typeof isAvailable === "boolean" ? { isAvailable } : {}),
        ...(pricePaise ? { pricePaise: Number(pricePaise) } : {}),
        ...(name ? { name } : {}),
        ...(description ? { description } : {}),
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
