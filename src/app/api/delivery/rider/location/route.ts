import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { latitude, longitude } = body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const updated = await prisma.riderProfile.update({
      where: { userId: user.id },
      data: {
        currentLatitude: latitude,
        currentLongitude: longitude,
        lastPingAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, coordinates: { latitude, longitude }, updated });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
