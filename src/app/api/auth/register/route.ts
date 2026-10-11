import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, role = "CUSTOMER", vehicleType, licenseNumber, restaurantId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Full Name is required" }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone?.trim() || `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`;

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Determine valid role
    const validRoles = ["CUSTOMER", "RESTAURANT_STAFF", "RIDER", "ADMIN"];
    const targetRole = validRoles.includes(role) ? role : "CUSTOMER";

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        role: targetRole,
      },
    });

    // If Rider, create RiderProfile
    if (targetRole === "RIDER") {
      await prisma.riderProfile.create({
        data: {
          userId: newUser.id,
          vehicleType: vehicleType || "MOTORCYCLE",
          licenseNumber: licenseNumber?.trim() || `DL-MH-${Math.floor(100000 + Math.random() * 900000)}`,
          isAvailable: true,
          currentLatitude: 19.0760,
          currentLongitude: 72.8777,
        },
      });
    }

    // If Restaurant Staff and restaurant selected
    if (targetRole === "RESTAURANT_STAFF" && restaurantId) {
      const restExists = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
      });
      if (restExists) {
        await prisma.restaurantStaff.create({
          data: {
            userId: newUser.id,
            restaurantId: restaurantId,
            role: "STAFF",
          },
        });
      }
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("ofds_user_id", newUser.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      sameSite: "lax",
    });

    // Target redirect
    let redirectUrl = "/";
    if (targetRole === "RESTAURANT_STAFF") redirectUrl = "/restaurant";
    else if (targetRole === "RIDER") redirectUrl = "/rider";
    else if (targetRole === "ADMIN") redirectUrl = "/admin";

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        restaurantId: targetRole === "RESTAURANT_STAFF" ? restaurantId || null : null,
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
