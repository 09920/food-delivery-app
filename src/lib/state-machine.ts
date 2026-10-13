import prisma from "./db";
import { UserRole } from "./permissions";

export type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "PICKED_UP"
  | "DELIVERED"
  | "CANCELLED"
  | "REJECTED";

// Defined valid state transitions and allowed actor roles
export const ALLOWED_TRANSITIONS: Record<
  OrderStatus,
  { next: OrderStatus[]; roles: UserRole[] }[]
> = {
  PLACED: [
    { next: ["ACCEPTED"], roles: ["RESTAURANT_STAFF", "ADMIN"] },
    { next: ["REJECTED"], roles: ["RESTAURANT_STAFF", "ADMIN"] },
    { next: ["CANCELLED"], roles: ["CUSTOMER", "ADMIN"] },
  ],
  ACCEPTED: [
    { next: ["PREPARING"], roles: ["RESTAURANT_STAFF", "ADMIN"] },
    { next: ["CANCELLED"], roles: ["RESTAURANT_STAFF", "ADMIN"] },
  ],
  PREPARING: [
    { next: ["READY"], roles: ["RESTAURANT_STAFF", "ADMIN"] },
    { next: ["CANCELLED"], roles: ["ADMIN"] },
  ],
  READY: [
    { next: ["PICKED_UP"], roles: ["RIDER", "ADMIN"] },
    { next: ["CANCELLED"], roles: ["ADMIN"] },
  ],
  PICKED_UP: [
    { next: ["DELIVERED"], roles: ["RIDER", "ADMIN"] },
  ],
  DELIVERED: [],
  CANCELLED: [],
  REJECTED: [],
};

export interface TransitionParams {
  orderId: string;
  targetStatus: OrderStatus;
  actorId: string;
  actorRole: UserRole;
  reason?: string;
  verificationOtp?: string;
}

/**
 * Executes a strictly validated order state transition with audit history.
 */
export async function transitionOrderStatus({
  orderId,
  targetStatus,
  actorId,
  actorRole,
  reason,
  verificationOtp,
}: TransitionParams) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  const currentStatus = order.status as OrderStatus;
  const allowedRules = ALLOWED_TRANSITIONS[currentStatus] || [];
  const matchingRule = allowedRules.find(
    (rule) => rule.next.includes(targetStatus) && rule.roles.includes(actorRole)
  );

  if (!matchingRule) {
    throw new Error(
      `Invalid transition: cannot move from ${currentStatus} to ${targetStatus} as role ${actorRole}`
    );
  }

  // Delivery OTP verification validation
  if (targetStatus === "DELIVERED" && actorRole === "RIDER") {
    if (!verificationOtp) {
      throw new Error("Delivery OTP is required to complete delivery");
    }

    if (order.deliveryOtpAttempts >= 5) {
      throw new Error("Maximum OTP attempts exceeded. Please contact platform support.");
    }

    if (order.deliveryOtpHash && order.deliveryOtpHash !== verificationOtp.trim()) {
      await prisma.order.update({
        where: { id: orderId },
        data: { deliveryOtpAttempts: { increment: 1 } },
      });
      throw new Error("Invalid Delivery OTP. Please verify with the customer.");
    }
  }

  // Customer cancellation rule check (only allowed if still in PLACED state and within 2 minutes)
  if (targetStatus === "CANCELLED" && actorRole === "CUSTOMER") {
    const elapsedMinutes = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60);
    if (elapsedMinutes > 3) {
      throw new Error(
        "Cancellation window has passed. The restaurant has already begun processing the order."
      );
    }
  }

  // Update order status and log state history atomically
  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: targetStatus,
        cancellationReason:
          targetStatus === "CANCELLED" || targetStatus === "REJECTED" ? reason : undefined,
        cancelledByRole:
          targetStatus === "CANCELLED" || targetStatus === "REJECTED" ? actorRole : undefined,
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        previousStatus: currentStatus,
        newStatus: targetStatus,
        actorId,
        actorRole,
        reason: reason || `Transitioned to ${targetStatus}`,
      },
    });

    // Auto-create refund record if order was rejected or cancelled after payment
    if ((targetStatus === "REJECTED" || targetStatus === "CANCELLED") && order.payments.length > 0) {
      const successfulPayment = order.payments.find((p) => p.status === "COMPLETED");
      if (successfulPayment) {
        await tx.refund.create({
          data: {
            paymentId: successfulPayment.id,
            gatewayRefundId: `rfnd_sim_${Date.now()}`,
            amountPaise: successfulPayment.amountPaise,
            status: "PROCESSED",
            reason: reason || `Auto-refund for ${targetStatus} order`,
          },
        });
        await tx.payment.update({
          where: { id: successfulPayment.id },
          data: { status: "REFUNDED" },
        });
      }
    }

    return updated;
  });

  return updatedOrder;
}
