import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser, DEMO_USERS } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      restaurantStaff: {
        select: {
          restaurant: { select: { id: true, name: true } },
        },
      },
    },
  });

  return NextResponse.json({
    user,
    availablePersonas: allUsers,
    demoPresets: DEMO_USERS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cookieStore = await cookies();
    cookieStore.set("ofds_user_id", user.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: false,
      sameSite: "lax",
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
