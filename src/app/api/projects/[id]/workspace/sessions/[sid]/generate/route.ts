import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateResponses } from "@/lib/services/workspace-service";
import { workspaceGenerateSchema } from "@/lib/validators/workspace";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sid } = await params;
  const body = await req.json();
  const parsed = workspaceGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const responses = await generateResponses(sid, parsed.data);
    return NextResponse.json(responses);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Generation failed", details: message },
      { status: 500 }
    );
  }
}
