import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { discoveredItems, monitoredTopics, monitoringSources } from "@/lib/db/schema";
import { eq, and, desc, gte, lte, inArray, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get("topicId");
  const sourceId = searchParams.get("sourceId");
  const status = searchParams.get("status");
  const minScore = searchParams.get("minScore");
  const maxScore = searchParams.get("maxScore");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");

  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;

  // Get user's topic IDs for authorization (skip for admins)
  let userTopicIds: string[] | null = null;
  if (!isAdmin) {
    const userTopics = await db
      .select({ id: monitoredTopics.id })
      .from(monitoredTopics)
      .where(eq(monitoredTopics.userId, session.user.id));

    userTopicIds = userTopics.map((t) => t.id);
    if (userTopicIds.length === 0) {
      return NextResponse.json({ items: [], total: 0, page, pageSize });
    }
  }

  const conditions = userTopicIds ? [inArray(discoveredItems.topicId, userTopicIds)] : [];

  if (topicId) conditions.push(eq(discoveredItems.topicId, topicId));
  if (sourceId) conditions.push(eq(discoveredItems.sourceId, sourceId));
  if (status) conditions.push(eq(discoveredItems.status, status));
  if (minScore) conditions.push(gte(discoveredItems.relevanceScore, parseInt(minScore)));
  if (maxScore) conditions.push(lte(discoveredItems.relevanceScore, parseInt(maxScore)));

  const where = and(...conditions);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(discoveredItems)
    .where(where);

  const items = await db
    .select({
      item: discoveredItems,
      topicName: monitoredTopics.name,
      sourceType: monitoringSources.sourceType,
    })
    .from(discoveredItems)
    .innerJoin(monitoredTopics, eq(discoveredItems.topicId, monitoredTopics.id))
    .innerJoin(monitoringSources, eq(discoveredItems.sourceId, monitoringSources.id))
    .where(where)
    .orderBy(desc(discoveredItems.discoveredAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return NextResponse.json({
    items: items.map((i) => ({ ...i.item, topicName: i.topicName, sourceType: i.sourceType })),
    total: countResult.count,
    page,
    pageSize,
  });
}
