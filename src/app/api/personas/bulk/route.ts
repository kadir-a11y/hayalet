import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPersona } from "@/lib/services/persona-service";
import { personaCreateSchema } from "@/lib/validators/persona";
import { logActivity } from "@/lib/services/activity-log-service";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!Array.isArray(body.personas) || body.personas.length === 0) {
    return NextResponse.json(
      { error: "personas array is required" },
      { status: 400 }
    );
  }

  if (body.personas.length > 50) {
    return NextResponse.json(
      { error: "Maximum 50 personas per batch" },
      { status: 400 }
    );
  }

  const results: { index: number; success: boolean; persona?: any; error?: string }[] = [];

  for (let i = 0; i < body.personas.length; i++) {
    const parsed = personaCreateSchema.safeParse(body.personas[i]);
    if (!parsed.success) {
      results.push({
        index: i,
        success: false,
        error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", "),
      });
      continue;
    }

    try {
      const persona = await createPersona(session.user.id, parsed.data);
      await logActivity(session.user.id, "persona", persona.id, "created", {
        name: persona.name,
        bulk: true,
      });
      results.push({ index: i, success: true, persona });
    } catch (err) {
      results.push({
        index: i,
        success: false,
        error: err instanceof Error ? err.message : "Creation failed",
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  return NextResponse.json(
    { results, successCount, totalCount: body.personas.length },
    { status: 201 }
  );
}
