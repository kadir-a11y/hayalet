import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLogs } from "@/lib/services/organic-activity-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);

  const filters = {
    platform: searchParams.get("platform") || undefined,
    status: searchParams.get("status") || undefined,
    limit: parseInt(searchParams.get("limit") || "50", 10),
    offset: parseInt(searchParams.get("offset") || "0", 10),
  };

  const logs = await getLogs(id, filters);
  return NextResponse.json(logs);
}
