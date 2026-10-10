import prisma from "@/lib/db";
import { calculateDistanceKm } from "@/lib/formatters";

/**
 * Generates a random 4-digit numeric delivery OTP
 */
export function generateDeliveryOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Finds the closest available rider and creates a delivery offer
 */
export async function assignRiderToOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { restaurant: true },
  });

  if (!order || !order.restaurant) {
    throw new Error("Order or restaurant not found");
  }

  // Find all available riders
  const availableRiders = await prisma.riderProfile.findMany({
    where: { isAvailable: true },
    include: { user: true },
  });

  if (availableRiders.length === 0) {
    return { success: false, message: "No active riders currently available" };
  }

  // Rank riders by distance to restaurant
  const rankedRiders = availableRiders
    .map((rider) => {
      const distance = calculateDistanceKm(
        rider.currentLatitude,
        rider.currentLongitude,
        order.restaurant.latitude,
        order.restaurant.longitude
      );
      return { ...rider, distanceKm: distance };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const bestRider = rankedRiders[0];

  // Auto-assign rider for seamless experience
  await prisma.order.update({
    where: { id: orderId },
    data: {
      riderId: bestRider.userId,
    },
  });

  // Create offer record
  await prisma.riderOffer.create({
    data: {
      orderId,
      riderId: bestRider.userId,
      status: "ACCEPTED",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  return {
    success: true,
    riderId: bestRider.userId,
    riderName: bestRider.user.name,
    distanceKm: bestRider.distanceKm,
  };
}
