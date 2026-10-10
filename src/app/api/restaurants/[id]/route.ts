import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        categories: {
          orderBy: { displayOrder: "asc" },
          include: {
            menuItems: {
              orderBy: { pricePaise: "asc" },
            },
          },
        },
        operatingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json({ restaurant });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
