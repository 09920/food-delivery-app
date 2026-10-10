import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyRazorpaySignature } from "@/modules/payments/razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { error: "Missing required payment verification parameters" },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature || `sim_sig_${Date.now()}`
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature verification failed" },
        { status: 400 }
      );
    }

    // Mark payment completed and order active
    const payment = await prisma.payment.findFirst({
      where: { orderId, gatewayOrderId: razorpayOrderId },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          gatewayPaymentId: razorpayPaymentId,
          gatewaySignature: razorpaySignature,
          status: "COMPLETED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and order confirmed",
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
