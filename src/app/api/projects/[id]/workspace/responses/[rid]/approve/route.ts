import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { approveResponse } from "@/lib/services/workspace-service";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; rid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rid } = await params;
  const response = await approveResponse(rid);
  if (!response) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(response);
}
