import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPersonaById, updatePersona, deletePersona } from "@/lib/services/persona-service";
import { personaUpdateSchema } from "@/lib/validators/persona";
import { logActivity } from "@/lib/services/activity-log-service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  const persona = await getPersonaById(id, session.user.id, isAdmin);
  if (!persona) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(persona);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = personaUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  const persona = await updatePersona(id, session.user.id, parsed.data, isAdmin);
  if (!persona) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await logActivity(session.user.id, "persona", id, "updated");
  return NextResponse.json(persona);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  const persona = await deletePersona(id, session.user.id, isAdmin);
  if (!persona) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await logActivity(session.user.id, "persona", id, "deleted", { name: persona.name });
  return NextResponse.json({ success: true });
}
