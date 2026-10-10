export type UserRole = "CUSTOMER" | "RESTAURANT_STAFF" | "RIDER" | "ADMIN";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  restaurantId?: string | null; // For restaurant staff
}

export type Action =
  | "view_profile"
  | "update_profile"
  | "manage_address"
  | "browse_restaurants"
  | "create_order"
  | "view_order"
  | "cancel_order"
  | "manage_menu"
  | "accept_reject_order"
  | "update_prep_status"
  | "view_restaurant_analytics"
  | "view_delivery_offers"
  | "accept_delivery_offer"
  | "update_delivery_status"
  | "submit_delivery_otp"
  | "post_review"
  | "create_support_ticket"
  | "view_support_ticket"
  | "admin_manage_restaurants"
  | "admin_manage_users"
  | "admin_manage_coupons"
  | "admin_view_audit_logs"
  | "admin_trigger_refund";

export type Resource =
  | { type: "order"; customerId: string; restaurantId: string; riderId?: string | null }
  | { type: "user_profile"; userId: string }
  | { type: "customer_address"; userId: string }
  | { type: "restaurant"; restaurantId: string }
  | { type: "delivery_offer"; riderId: string }
  | { type: "review"; customerId: string; orderStatus: string }
  | { type: "support_ticket"; userId: string }
  | { type: "admin_dashboard" }
  | { type: "public" };

/**
 * Centralized authorization engine implementing least-privilege role-based access control.
 */
export function can(user: SessionUser | null | undefined, action: Action, resource: Resource): boolean {
  if (!user) {
    // Public actions permissible to unauthenticated visitors
    if (action === "browse_restaurants" && resource.type === "public") return true;
    return false;
  }

  // Admin possesses platform-wide supervisory authorization
  if (user.role === "ADMIN") {
    return true;
  }

  // Customer authorization rules
  if (user.role === "CUSTOMER") {
    switch (action) {
      case "view_profile":
      case "update_profile":
        return resource.type === "user_profile" && resource.userId === user.id;

      case "manage_address":
        return resource.type === "customer_address" && resource.userId === user.id;

      case "browse_restaurants":
        return true;

      case "create_order":
        return true;

      case "view_order":
        return resource.type === "order" && resource.customerId === user.id;

      case "cancel_order":
        return resource.type === "order" && resource.customerId === user.id;

      case "post_review":
        return (
          resource.type === "review" &&
          resource.customerId === user.id &&
          resource.orderStatus === "DELIVERED"
        );

      case "create_support_ticket":
      case "view_support_ticket":
        return resource.type === "support_ticket" && resource.userId === user.id;

      default:
        return false;
    }
  }

  // Restaurant Staff authorization rules (strictly scoped to own restaurantId)
  if (user.role === "RESTAURANT_STAFF") {
    if (!user.restaurantId) return false;

    switch (action) {
      case "manage_menu":
      case "view_restaurant_analytics":
        return resource.type === "restaurant" && resource.restaurantId === user.restaurantId;

      case "accept_reject_order":
      case "update_prep_status":
      case "view_order":
        return resource.type === "order" && resource.restaurantId === user.restaurantId;

      default:
        return false;
    }
  }

  // Delivery Rider authorization rules (strictly scoped to assigned orders)
  if (user.role === "RIDER") {
    switch (action) {
      case "view_delivery_offers":
      case "accept_delivery_offer":
        return resource.type === "delivery_offer" && resource.riderId === user.id;

      case "view_order":
      case "update_delivery_status":
      case "submit_delivery_otp":
        return resource.type === "order" && resource.riderId === user.id;

      default:
        return false;
    }
  }

  return false;
}
