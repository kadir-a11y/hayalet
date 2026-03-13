import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addMockFeedData } from "@/lib/services/content-feed-service";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const inserted = await addMockFeedData(id);
  return NextResponse.json({ count: inserted.length }, { status: 201 });
}
