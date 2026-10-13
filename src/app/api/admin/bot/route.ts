import { NextRequest, NextResponse } from "next/server";
import { getAutoPilotConfig, setAutoPilotConfig } from "@/lib/bot-simulator";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const config = getAutoPilotConfig();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const updated = setAutoPilotConfig(body);
    return NextResponse.json({ success: true, config: updated });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
