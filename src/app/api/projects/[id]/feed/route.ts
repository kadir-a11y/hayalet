import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFeed, getPlatformCounts } from "@/lib/services/content-feed-service";

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

  const platform = searchParams.get("platform") || undefined;
  const limit = parseInt(searchParams.get("limit") || "30", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const [feed, platformCounts] = await Promise.all([
    getFeed(id, { platform, limit, offset }),
    getPlatformCounts(id),
  ]);

  return NextResponse.json({ ...feed, platformCounts });
}
