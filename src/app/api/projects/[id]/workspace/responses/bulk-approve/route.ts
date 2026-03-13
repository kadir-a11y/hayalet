import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { bulkApproveResponses } from "@/lib/services/workspace-service";
import { workspaceBulkApproveSchema } from "@/lib/validators/workspace";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await params;
  const body = await req.json();
  const parsed = workspaceBulkApproveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const responses = await bulkApproveResponses(parsed.data.responseIds);
  return NextResponse.json(responses);
}
