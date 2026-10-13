import { cookies } from "next/headers";
import prisma from "./db";
import { SessionUser, UserRole } from "./permissions";

export const DEMO_USERS = {
  customer: {
    id: "usr_customer_1",
    name: "Rahul Sharma",
    email: "rahul@example.com",
    role: "CUSTOMER" as UserRole,
  },
  customer2: {
    id: "usr_customer_2",
    name: "Priya Patel",
    email: "priya@example.com",
    role: "CUSTOMER" as UserRole,
  },
  restaurant_staff: {
    id: "usr_staff_royal",
    name: "Vikram Singhania",
    email: "vikram@royalspice.com",
    role: "RESTAURANT_STAFF" as UserRole,
    restaurantId: "rest_royal_spice",
  },
  restaurant_staff2: {
    id: "usr_staff_dragon",
    name: "Chef Lin Mei",
    email: "lin@dragonwok.com",
    role: "RESTAURANT_STAFF" as UserRole,
    restaurantId: "rest_dragon_wok",
  },
  rider: {
    id: "usr_rider_amit",
    name: "Amit Kumar",
    email: "amit.rider@example.com",
    role: "RIDER" as UserRole,
  },
  admin: {
    id: "usr_admin_platform",
    name: "Sanjay Mehra (Ops Admin)",
    email: "admin@ofds-platform.com",
    role: "ADMIN" as UserRole,
  },
};

/**
 * Resolves current active user from cookies or returns null if unauthenticated
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const activeUserId = cookieStore.get("ofds_user_id")?.value;

    if (activeUserId) {
      const user = await prisma.user.findUnique({
        where: { id: activeUserId },
        include: {
          restaurantStaff: { select: { restaurantId: true } },
        },
      });

      if (user) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          restaurantId: user.restaurantStaff[0]?.restaurantId || null,
        };
      }
    }
  } catch {
    // Fallback if accessed outside request context
  }

  return null;
}

