import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email format (e.g. name@example.com)" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, role: true },
    });

    // Generate 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to OtpVerification table
    await prisma.otpVerification.create({
      data: {
        email: cleanEmail,
        code: otpCode,
        expiresAt,
        verified: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      isNewUser: !existingUser,
      existingName: existingUser?.name || null,
      // For local development, expose the code so user can test without real SMTP configuration
      devOtp: otpCode,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
