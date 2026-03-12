import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActivityLogs } from "@/lib/services/activity-log-service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  const logs = await getActivityLogs(session.user.id, limit, offset, isAdmin);
  return NextResponse.json(logs);
}
