import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { transitionOrderStatus, OrderStatus } from "@/lib/state-machine";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    const { id } = await context.params;
    const body = await req.json();

    const { targetStatus, reason, verificationOtp } = body as {
      targetStatus: OrderStatus;
      reason?: string;
      verificationOtp?: string;
    };

    if (!targetStatus) {
      return NextResponse.json({ error: "targetStatus is required" }, { status: 400 });
    }

    const updatedOrder = await transitionOrderStatus({
      orderId: id,
      targetStatus,
      actorId: user.id,
      actorRole: user.role,
      reason,
      verificationOtp,
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
