import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { autoPostRules, monitoredTopics } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { ruleUpdateSchema } from "@/lib/validators/monitoring";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = ruleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [rule] = await db
    .select()
    .from(autoPostRules)
    .where(eq(autoPostRules.id, id))
    .limit(1);

  if (!rule) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [topic] = await db
    .select()
    .from(monitoredTopics)
    .where(and(eq(monitoredTopics.id, rule.topicId), eq(monitoredTopics.userId, session.user.id)))
    .limit(1);

  if (!topic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(autoPostRules)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(autoPostRules.id, id))
    .returning();

  return NextResponse.json(updated);
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

  const [rule] = await db
    .select()
    .from(autoPostRules)
    .where(eq(autoPostRules.id, id))
    .limit(1);

  if (!rule) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [topic] = await db
    .select()
    .from(monitoredTopics)
    .where(and(eq(monitoredTopics.id, rule.topicId), eq(monitoredTopics.userId, session.user.id)))
    .limit(1);

  if (!topic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(autoPostRules).where(eq(autoPostRules.id, id));

  return NextResponse.json({ success: true });
}
