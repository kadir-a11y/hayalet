import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { monitoredTopics, monitoringSources, discoveredItems } from "@/lib/db/schema";
import { eq, desc, sql, inArray } from "drizzle-orm";
import { topicCreateSchema } from "@/lib/validators/monitoring";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  const topics = await db
    .select()
    .from(monitoredTopics)
    .where(isAdmin ? undefined : eq(monitoredTopics.userId, session.user.id))
    .orderBy(desc(monitoredTopics.createdAt));

  if (topics.length === 0) return NextResponse.json([]);

  const topicIds = topics.map((t) => t.id);

  const sourceCounts = await db
    .select({
      topicId: monitoringSources.topicId,
      count: sql<number>`count(*)::int`,
    })
    .from(monitoringSources)
    .where(inArray(monitoringSources.topicId, topicIds))
    .groupBy(monitoringSources.topicId);

  const itemCounts = await db
    .select({
      topicId: discoveredItems.topicId,
      count: sql<number>`count(*)::int`,
    })
    .from(discoveredItems)
    .where(inArray(discoveredItems.topicId, topicIds))
    .groupBy(discoveredItems.topicId);

  const sourceMap = new Map(sourceCounts.map((s) => [s.topicId, s.count]));
  const itemMap = new Map(itemCounts.map((i) => [i.topicId, i.count]));

  const result = topics.map((t) => ({
    ...t,
    sourceCount: sourceMap.get(t.id) || 0,
    discoveredCount: itemMap.get(t.id) || 0,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = topicCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [topic] = await db
    .insert(monitoredTopics)
    .values({
      userId: session.user.id,
      name: parsed.data.name,
      keywords: parsed.data.keywords,
      language: parsed.data.language,
      checkIntervalMinutes: parsed.data.checkIntervalMinutes,
      isActive: parsed.data.isActive,
    })
    .returning();

  return NextResponse.json(topic, { status: 201 });
}
