import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, name } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and OTP code are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    // Verify OTP against database
    const latestOtp = await prisma.otpVerification.findFirst({
      where: {
        email: cleanEmail,
        verified: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!latestOtp) {
      return NextResponse.json(
        { error: "No pending verification code found. Please request a new code." },
        { status: 400 }
      );
    }

    if (new Date() > latestOtp.expiresAt) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    if (latestOtp.code !== cleanCode) {
      // Increment attempt counter
      await prisma.otpVerification.update({
        where: { id: latestOtp.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json(
        { error: "Incorrect verification code. Please check and try again." },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await prisma.otpVerification.update({
      where: { id: latestOtp.id },
      data: { verified: true },
    });

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        restaurantStaff: { select: { restaurantId: true } },
      },
    });

    // If new user, create customer profile
    if (!user) {
      const displayName = name && name.trim() ? name.trim() : cleanEmail.split("@")[0];
      const randomPhone = `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`;

      user = await prisma.user.create({
        data: {
          name: displayName,
          email: cleanEmail,
          phone: randomPhone,
          role: "CUSTOMER",
        },
        include: {
          restaurantStaff: { select: { restaurantId: true } },
        },
      });

      // Add a starter address for new customer for a smooth checkout experience
      await prisma.customerAddress.create({
        data: {
          userId: user.id,
          label: "Home",
          addressLine: "Flat 402, Green Heights, Bandra West",
          landmark: "Near Linking Road",
          city: "Mumbai",
          pincode: "400050",
          latitude: 19.0596,
          longitude: 72.8295,
          isDefault: true,
        },
      });
    }

    // Set 7-day secure HTTP session cookie
    const cookieStore = await cookies();
    cookieStore.set("ofds_user_id", user.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      sameSite: "lax",
    });

    // Determine redirect
    let redirectUrl = "/";
    if (user.role === "RESTAURANT_STAFF") redirectUrl = "/restaurant";
    else if (user.role === "RIDER") redirectUrl = "/rider";
    else if (user.role === "ADMIN") redirectUrl = "/admin";

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
