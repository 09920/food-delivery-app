import crypto from "crypto";
import prisma from "@/lib/db";

const KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_food_mock_key";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "rzp_mock_secret_998877";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "rzp_whsec_mock_443322";

export interface CreatePaymentOrderResult {
  gatewayOrderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  isMockMode: boolean;
}

/**
 * Creates a Razorpay payment order for the specified order
 */
export async function createRazorpayOrder(
  orderId: string,
  amountPaise: number,
  idempotencyKey: string
): Promise<CreatePaymentOrderResult> {
  // Check if payment already exists for this idempotency key or order
  const existingPayment = await prisma.payment.findFirst({
    where: {
      OR: [{ idempotencyKey }, { orderId, status: "COMPLETED" }],
    },
  });

  if (existingPayment) {
    if (existingPayment.status === "COMPLETED") {
      throw new Error("This order has already been paid for.");
    }
    return {
      gatewayOrderId: existingPayment.gatewayOrderId,
      amountPaise: existingPayment.amountPaise,
      currency: "INR",
      keyId: KEY_ID,
      isMockMode: KEY_ID.includes("mock"),
    };
  }

  // Generate gateway order ID (format: order_rzp_...)
  const gatewayOrderId = `order_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Record payment intent in database
  await prisma.payment.create({
    data: {
      orderId,
      gateway: "RAZORPAY",
      gatewayOrderId,
      amountPaise,
      status: "PENDING",
      idempotencyKey,
    },
  });

  return {
    gatewayOrderId,
    amountPaise,
    currency: "INR",
    keyId: KEY_ID,
    isMockMode: KEY_ID.includes("mock"),
  };
}

/**
 * Verifies Razorpay HMAC SHA256 payment signature
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (KEY_ID.includes("mock")) {
    // In mock/test dev mode, accept signatures starting with "sim_sig_" or legitimate verification
    if (signature.startsWith("sim_sig_")) return true;
  }

  const generatedSignature = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

/**
 * Verifies Razorpay Webhook signature
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (KEY_ID.includes("mock") && signature === "mock_webhook_signature") {
    return true;
  }

  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return expectedSignature === signature;
}
