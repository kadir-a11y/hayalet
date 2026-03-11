import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPersonasWithTags, createPersona } from "@/lib/services/persona-service";
import { personaCreateSchema } from "@/lib/validators/persona";
import { logActivity } from "@/lib/services/activity-log-service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const personas = await getPersonasWithTags(session.user.id);
  return NextResponse.json(personas);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = personaCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const persona = await createPersona(session.user.id, parsed.data);
  await logActivity(session.user.id, "persona", persona.id, "created", { name: persona.name });

  return NextResponse.json(persona, { status: 201 });
}
