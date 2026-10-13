import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { restaurantId, isApproved, isOpen } = body;

    if (!restaurantId) {
      return NextResponse.json({ error: "restaurantId is required" }, { status: 400 });
    }

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...(typeof isApproved === "boolean" ? { isApproved } : {}),
        ...(typeof isOpen === "boolean" ? { isOpen } : {}),
      },
    });

    // Log action to AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: typeof isApproved === "boolean" ? (isApproved ? "RESTAURANT_APPROVED" : "RESTAURANT_SUSPENDED") : "STATUS_UPDATED",
        resource: "Restaurant",
        resourceId: restaurantId,
        metadata: JSON.stringify({ isApproved, isOpen }),
      },
    });

    return NextResponse.json({ success: true, restaurant: updated });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
