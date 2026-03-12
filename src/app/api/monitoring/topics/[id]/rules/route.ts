import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { monitoredTopics, autoPostRules } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { ruleCreateSchema } from "@/lib/validators/monitoring";

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

  const [topic] = await db
    .select()
    .from(monitoredTopics)
    .where(isAdmin ? eq(monitoredTopics.id, id) : and(eq(monitoredTopics.id, id), eq(monitoredTopics.userId, session.user.id)))
    .limit(1);

  if (!topic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rules = await db
    .select()
    .from(autoPostRules)
    .where(eq(autoPostRules.topicId, id));

  return NextResponse.json(rules);
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
  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;

  const [topic] = await db
    .select()
    .from(monitoredTopics)
    .where(isAdmin ? eq(monitoredTopics.id, id) : and(eq(monitoredTopics.id, id), eq(monitoredTopics.userId, session.user.id)))
    .limit(1);

  if (!topic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = ruleCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [rule] = await db
    .insert(autoPostRules)
    .values({
      topicId: id,
      minRelevanceScore: parsed.data.minRelevanceScore,
      targetPlatforms: parsed.data.targetPlatforms,
      targetPersonaTagIds: parsed.data.targetPersonaTagIds,
      maxPostsPerDay: parsed.data.maxPostsPerDay,
      requiresApproval: parsed.data.requiresApproval,
      isActive: parsed.data.isActive,
    })
    .returning();

  return NextResponse.json(rule, { status: 201 });
}
