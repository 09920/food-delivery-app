import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({
        favoriteRestaurants: [],
        favoriteDishes: [],
      });
    }
    const favRestaurants = await prisma.favoriteRestaurant.findMany({
      where: { userId: user.id },
      include: { restaurant: true },
    });
    const favDishes = await prisma.favoriteDish.findMany({
      where: { userId: user.id },
      include: { menuItem: { include: { restaurant: true } } },
    });

    return NextResponse.json({
      favoriteRestaurants: favRestaurants.map((f) => f.restaurant),
      favoriteDishes: favDishes.map((f) => f.menuItem),
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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }
    const body = await req.json();
    const { restaurantId, menuItemId } = body;

    if (restaurantId) {
      const existing = await prisma.favoriteRestaurant.findUnique({
        where: { userId_restaurantId: { userId: user.id, restaurantId } },
      });
      if (existing) {
        await prisma.favoriteRestaurant.delete({ where: { id: existing.id } });
        return NextResponse.json({ isFavorite: false });
      } else {
        await prisma.favoriteRestaurant.create({
          data: { userId: user.id, restaurantId },
        });
        return NextResponse.json({ isFavorite: true });
      }
    }

    if (menuItemId) {
      const existing = await prisma.favoriteDish.findUnique({
        where: { userId_menuItemId: { userId: user.id, menuItemId } },
      });
      if (existing) {
        await prisma.favoriteDish.delete({ where: { id: existing.id } });
        return NextResponse.json({ isFavorite: false });
      } else {
        await prisma.favoriteDish.create({
          data: { userId: user.id, menuItemId },
        });
        return NextResponse.json({ isFavorite: true });
      }
    }

    return NextResponse.json({ error: "Provide restaurantId or menuItemId" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
