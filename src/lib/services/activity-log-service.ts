import { db } from "@/lib/db";
import { activityLog } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export async function logActivity(
  userId: string,
  entityType: string,
  entityId: string,
  action: string,
  details?: Record<string, unknown>
) {
  const [log] = await db
    .insert(activityLog)
    .values({
      userId,
      entityType,
      entityId,
      action,
      details: details || {},
    })
    .returning();

  return log;
}

export async function getActivityLogs(
  userId: string,
  limit = 50,
  offset = 0
) {
  return db
    .select()
    .from(activityLog)
    .where(eq(activityLog.userId, userId))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getActivityStats(userId: string, days = 30) {
  const result = await db
    .select({
      date: sql<string>`DATE(${activityLog.createdAt})`,
      action: activityLog.action,
      count: sql<number>`count(*)::int`,
    })
    .from(activityLog)
    .where(
      and(
        eq(activityLog.userId, userId),
        sql`${activityLog.createdAt} >= NOW() - INTERVAL '${sql.raw(String(days))} days'`
      )
    )
    .groupBy(sql`DATE(${activityLog.createdAt})`, activityLog.action)
    .orderBy(sql`DATE(${activityLog.createdAt})`);

  return result;
}
