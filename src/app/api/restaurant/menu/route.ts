import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const requestedRestId = searchParams.get("restaurantId");

    // Look up staff record for this user
    const staff = await prisma.restaurantStaff.findFirst({
      where: { userId: user.id },
      include: { restaurant: true },
    });

    const targetRestaurantId =
      requestedRestId || staff?.restaurantId || user.restaurantId;

    if (!targetRestaurantId) {
      // If user is ADMIN or testing without specific restaurant, load first restaurant
      if (user.role === "ADMIN") {
        const firstRest = await prisma.restaurant.findFirst({
          include: {
            categories: {
              include: { menuItems: true },
              orderBy: { displayOrder: "asc" },
            },
          },
        });
        if (firstRest) {
          return NextResponse.json({
            restaurant: { id: firstRest.id, name: firstRest.name },
            categories: firstRest.categories,
          });
        }
      }
      return NextResponse.json({
        restaurant: null,
        categories: [],
        message: "No restaurant assigned to this account",
      });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: targetRestaurantId },
      include: {
        categories: {
          include: {
            menuItems: {
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json({
      restaurant: { id: restaurant.id, name: restaurant.name },
      categories: restaurant.categories,
    });
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
    if (!user || (user.role !== "RESTAURANT_STAFF" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { categoryId, newCategoryName, name, description, pricePaise, isVegetarian, imageUrl, preparationMinutes } = body;

    const staff = await prisma.restaurantStaff.findFirst({
      where: { userId: user.id },
    });
    const restaurantId = staff?.restaurantId || user.restaurantId || body.restaurantId;

    if (!restaurantId) {
      return NextResponse.json({ error: "No restaurant assigned to your account" }, { status: 400 });
    }

    let targetCatId = categoryId;
    if (!targetCatId && newCategoryName && newCategoryName.trim()) {
      const newCat = await prisma.menuCategory.create({
        data: {
          restaurantId,
          name: newCategoryName.trim(),
          displayOrder: 1,
        },
      });
      targetCatId = newCat.id;
    }

    if (!targetCatId) {
      // Find or create default category for this restaurant
      let defaultCat = await prisma.menuCategory.findFirst({
        where: { restaurantId },
      });
      if (!defaultCat) {
        defaultCat = await prisma.menuCategory.create({
          data: {
            restaurantId,
            name: "Main Menu",
            displayOrder: 1,
          },
        });
      }
      targetCatId = defaultCat.id;
    }

    const item = await prisma.menuItem.create({
      data: {
        restaurantId,
        categoryId: targetCatId,
        name: name.trim(),
        description: description?.trim() || "",
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
    if (!user || (user.role !== "RESTAURANT_STAFF" && user.role !== "ADMIN")) {
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
