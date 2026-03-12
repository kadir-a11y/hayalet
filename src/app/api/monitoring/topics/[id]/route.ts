import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { monitoredTopics, monitoringSources, discoveredItems, autoPostRules } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { topicUpdateSchema } from "@/lib/validators/monitoring";

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

  const sources = await db
    .select()
    .from(monitoringSources)
    .where(eq(monitoringSources.topicId, id));

  const items = await db
    .select()
    .from(discoveredItems)
    .where(eq(discoveredItems.topicId, id))
    .orderBy(desc(discoveredItems.discoveredAt))
    .limit(100);

  const rules = await db
    .select()
    .from(autoPostRules)
    .where(eq(autoPostRules.topicId, id));

  return NextResponse.json({ ...topic, sources, discoveredItems: items, rules });
}

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
  const parsed = topicUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  const [topic] = await db
    .update(monitoredTopics)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(isAdmin ? eq(monitoredTopics.id, id) : and(eq(monitoredTopics.id, id), eq(monitoredTopics.userId, session.user.id)))
    .returning();

  if (!topic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(topic);
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
  const [topic] = await db
    .delete(monitoredTopics)
    .where(isAdmin ? eq(monitoredTopics.id, id) : and(eq(monitoredTopics.id, id), eq(monitoredTopics.userId, session.user.id)))
    .returning();

  if (!topic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
