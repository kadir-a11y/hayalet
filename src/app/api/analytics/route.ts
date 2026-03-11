import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPersonaCount } from "@/lib/services/persona-service";
import { getContentStats } from "@/lib/services/content-service";
import { getActivityLogs, getActivityStats } from "@/lib/services/activity-log-service";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [personaCount, contentStats, recentActivity, activityStats, campaignStats] = await Promise.all([
    getPersonaCount(session.user.id),
    getContentStats(session.user.id),
    getActivityLogs(session.user.id, 20),
    getActivityStats(session.user.id),
    db
      .select({
        status: campaigns.status,
        count: sql<number>`count(*)::int`,
      })
      .from(campaigns)
      .where(eq(campaigns.userId, session.user.id))
      .groupBy(campaigns.status),
  ]);

  return NextResponse.json({
    personaCount,
    contentStats,
    recentActivity,
    activityStats,
    campaignStats,
  });
}
