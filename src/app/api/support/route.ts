import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ tickets: [] });
    }
    const isAdmin = user.role === "ADMIN";

    const tickets = await prisma.supportTicket.findMany({
      where: isAdmin ? {} : { userId: user.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        order: { select: { id: true, orderNumber: true, totalPaise: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tickets });
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
    const { orderId, category, priority, subject, description } = body;

    if (!category || !subject || !description) {
      return NextResponse.json(
        { error: "Category, subject, and description are required" },
        { status: 400 }
      );
    }

    const ticketNumber = `TCK-${Math.floor(10000 + Math.random() * 90000)}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: user.id,
        orderId: orderId || null,
        category,
        priority: priority || "MEDIUM",
        subject,
        description,
        status: "OPEN",
      },
    });

    return NextResponse.json({ success: true, ticket });
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
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only administrators can resolve tickets" }, { status: 403 });
    }

    const body = await req.json();
    const { ticketId, status, resolution } = body;

    if (!ticketId || !status) {
      return NextResponse.json({ error: "ticketId and status are required" }, { status: 400 });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        resolution: resolution || undefined,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: "TICKET_RESOLVED",
        resource: "SupportTicket",
        resourceId: ticketId,
        metadata: JSON.stringify({ status, resolution }),
      },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
