import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { publishApprovedResponses } from "@/lib/services/workspace-service";
import { workspacePublishSchema } from "@/lib/validators/workspace";

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
  const parsed = workspacePublishSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const results = await publishApprovedResponses(
      parsed.data.sessionId,
      parsed.data.staggerMinutes
    );
    return NextResponse.json(results);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Publishing failed", details: message },
      { status: 500 }
    );
  }
}
