import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier } = body;

    if (!identifier || !identifier.trim()) {
      return NextResponse.json(
        { error: "Please enter your Email or Phone number" },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Search by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: cleanIdentifier } },
          { phone: { contains: cleanIdentifier } },
        ],
      },
      include: {
        restaurantStaff: {
          select: { restaurantId: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: `No account found for "${identifier}". Please check your email/phone or sign up for a new account.`,
        },
        { status: 404 }
      );
    }

    // Set persistent session cookie
    const cookieStore = await cookies();
    cookieStore.set("ofds_user_id", user.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: false,
      sameSite: "lax",
    });

    // Determine target redirect based on role
    let redirectUrl = "/";
    if (user.role === "RESTAURANT_STAFF") {
      redirectUrl = "/restaurant";
    } else if (user.role === "RIDER") {
      redirectUrl = "/rider";
    } else if (user.role === "ADMIN") {
      redirectUrl = "/admin";
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        restaurantId: user.restaurantStaff[0]?.restaurantId || null,
      },
      redirectUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
