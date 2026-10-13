import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q")?.toLowerCase();
    const cuisine = searchParams.get("cuisine");
    const vegOnly = searchParams.get("vegOnly") === "true";
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const sortBy = searchParams.get("sortBy") || "rating"; // rating, time, cost

    const restaurants = await prisma.restaurant.findMany({
      where: {
        isApproved: true,
        ...(query
          ? {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } },
                { cuisineTypes: { contains: query } },
                {
                  menuItems: {
                    some: { name: { contains: query } },
                  },
                },
                {
                  categories: {
                    some: { name: { contains: query } },
                  },
                },
              ],
            }
          : {}),
        ...(cuisine
          ? {
              OR: [
                { cuisineTypes: { contains: cuisine } },
                {
                  categories: {
                    some: { name: { contains: cuisine } },
                  },
                },
                {
                  menuItems: {
                    some: { name: { contains: cuisine } },
                  },
                },
              ],
            }
          : {}),
        rating: { gte: minRating },
      },
      include: {
        categories: {
          orderBy: { displayOrder: "asc" },
          include: {
            menuItems: {
              where: vegOnly ? { isVegetarian: true } : {},
              orderBy: { pricePaise: "asc" },
            },
          },
        },
      },
      orderBy:
        sortBy === "rating"
          ? { rating: "desc" }
          : sortBy === "time"
          ? { averagePreparationMinutes: "asc" }
          : { name: "asc" },
    });

    return NextResponse.json({ restaurants });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
