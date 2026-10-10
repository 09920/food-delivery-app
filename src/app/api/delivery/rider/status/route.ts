import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();

    let profile = await prisma.riderProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.riderProfile.create({
        data: {
          userId: user.id,
          vehicleType: "MOTORCYCLE",
          licenseNumber: `DL-${Math.floor(100000 + Math.random() * 900000)}`,
          isAvailable: true,
          currentLatitude: 19.058,
          currentLongitude: 72.835,
        },
      });
    }

    // Active orders assigned to this rider
    const activeOrders = await prisma.order.findMany({
      where: {
        riderId: user.id,
        status: { in: ["READY", "PICKED_UP"] },
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        restaurant: { select: { id: true, name: true, phone: true, address: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Available pending offers
    const pendingOffers = await prisma.riderOffer.findMany({
      where: {
        riderId: user.id,
        status: "OFFERED",
        expiresAt: { gt: new Date() },
      },
      include: {
        order: {
          include: {
            restaurant: { select: { name: true, address: true } },
            items: true,
          },
        },
      },
    });

    return NextResponse.json({ profile, activeOrders, pendingOffers });
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
    const { isAvailable } = body;

    const profile = await prisma.riderProfile.upsert({
      where: { userId: user.id },
      update: { isAvailable: Boolean(isAvailable) },
      create: {
        userId: user.id,
        isAvailable: Boolean(isAvailable),
        licenseNumber: "DL-MH-01-2023",
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
