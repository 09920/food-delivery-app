import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    const addresses = await prisma.customerAddress.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ addresses });
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
    const { label, addressLine, landmark, city, pincode, latitude, longitude, isDefault } = body;

    if (!addressLine || !pincode) {
      return NextResponse.json(
        { error: "Address line and pincode are required" },
        { status: 400 }
      );
    }

    // If setting as default, unmark other defaults
    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.customerAddress.create({
      data: {
        userId: user.id,
        label: label || "Home",
        addressLine,
        landmark: landmark || null,
        city: city || "Mumbai",
        pincode,
        latitude: Number(latitude || 19.0544),
        longitude: Number(longitude || 72.8285),
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
