import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getSessionById,
  updateSession,
  deleteSession,
  getSessionResponses,
} from "@/lib/services/workspace-service";
import { workspaceSessionUpdateSchema } from "@/lib/validators/workspace";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sid } = await params;
  const wsSession = await getSessionById(sid);
  if (!wsSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const responses = await getSessionResponses(sid);
  return NextResponse.json({ ...wsSession, responses });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sid } = await params;
  const body = await req.json();
  const parsed = workspaceSessionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateSession(sid, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sid } = await params;
  const deleted = await deleteSession(sid);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
