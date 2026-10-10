import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { can } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await req.json();
    const { orderId, rating, comment } = body;

    if (!orderId || !rating || !comment) {
      return NextResponse.json(
        { error: "orderId, rating, and comment are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5 stars" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { review: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "Reviews are only permitted for successfully delivered orders" },
        { status: 400 }
      );
    }

    if (order.review) {
      return NextResponse.json(
        { error: "A review has already been submitted for this order" },
        { status: 400 }
      );
    }

    // Authorization check
    if (!can(user, "post_review", { type: "review", customerId: order.customerId, orderStatus: order.status })) {
      return NextResponse.json({ error: "Unauthorized to post review for this order" }, { status: 403 });
    }

    // Create review and update restaurant rating stats
    const review = await prisma.$transaction(async (tx) => {
      const createdReview = await tx.review.create({
        data: {
          orderId: order.id,
          restaurantId: order.restaurantId,
          userId: user.id,
          rating: Number(rating),
          comment: comment.trim(),
          isVerifiedPurchase: true,
        },
      });

      // Recalculate average restaurant rating
      const allReviews = await tx.review.findMany({
        where: { restaurantId: order.restaurantId },
        select: { rating: true },
      });

      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await tx.restaurant.update({
        where: { id: order.restaurantId },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: allReviews.length,
        },
      });

      return createdReview;
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
