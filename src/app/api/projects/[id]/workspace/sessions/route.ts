import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSessions, createSession } from "@/lib/services/workspace-service";
import { workspaceSessionCreateSchema } from "@/lib/validators/workspace";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sessions = await getSessions(id);
  return NextResponse.json(sessions);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = workspaceSessionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const wsSession = await createSession(id, session.user.id, parsed.data);
  return NextResponse.json(wsSession, { status: 201 });
}
