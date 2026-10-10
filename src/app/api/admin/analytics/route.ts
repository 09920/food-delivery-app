import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // 1. Order statistics
    const totalOrdersCount = await prisma.order.count();
    const deliveredOrders = await prisma.order.findMany({
      where: { status: "DELIVERED" },
      select: { totalPaise: true, platformFeePaise: true, subtotalPaise: true },
    });

    const grossOrderValuePaise = deliveredOrders.reduce((sum, o) => sum + o.totalPaise, 0);
    const platformCommissionPaise = deliveredOrders.reduce(
      (sum, o) => sum + o.platformFeePaise + Math.round(o.subtotalPaise * 0.15),
      0
    );

    // 2. Orders status counts
    const statusCountsRaw = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    const statusCounts = Object.fromEntries(
      statusCountsRaw.map((s) => [s.status, s._count.id])
    );

    // 3. Restaurants summary
    const restaurants = await prisma.restaurant.findMany({
      include: {
        _count: { select: { orders: true, menuItems: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // 4. Riders summary
    const riders = await prisma.riderProfile.findMany({
      include: {
        user: { select: { name: true, phone: true } },
      },
    });

    // 5. Recent audit logs
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // 6. Support Tickets
    const supportTickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    // 7. Active Coupons
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      metrics: {
        totalOrdersCount,
        grossOrderValuePaise,
        platformCommissionPaise,
        activeOrdersCount:
          (statusCounts["PLACED"] || 0) +
          (statusCounts["ACCEPTED"] || 0) +
          (statusCounts["PREPARING"] || 0) +
          (statusCounts["READY"] || 0) +
          (statusCounts["PICKED_UP"] || 0),
        statusCounts,
      },
      restaurants,
      riders,
      auditLogs,
      supportTickets,
      coupons,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
