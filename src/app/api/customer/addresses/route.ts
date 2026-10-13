import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ addresses: [] });
    }
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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }
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

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // Ignore if no body
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.customerAddress.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Address not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.customerAddress.delete({
      where: { id },
    });

    // If deleted address was default, promote the newest remaining address as default
    if (existing.isDefault) {
      const nextDefault = await prisma.customerAddress.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      if (nextDefault) {
        await prisma.customerAddress.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Address deleted successfully" });
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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }
    const body = await req.json();
    const { id, isDefault } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Address ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.customerAddress.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Address not found or unauthorized" },
        { status: 404 }
      );
    }

    if (isDefault) {
      await prisma.customerAddress.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });

      const updated = await prisma.customerAddress.update({
        where: { id },
        data: { isDefault: true },
      });

      return NextResponse.json({ success: true, address: updated });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
