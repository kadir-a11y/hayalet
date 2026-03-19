import { db } from "@/lib/db";
import { contentItems, socialAccounts } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

/**
 * Platform-specific action limits per day.
 * Conservative defaults to avoid bans.
 */
const PLATFORM_DAILY_LIMITS: Record<string, {
  posts: number;
  likes: number;
  follows: number;
  comments: number;
  cooldownMinutes: number;
}> = {
  twitter: { posts: 25, likes: 100, follows: 50, comments: 50, cooldownMinutes: 5 },
  instagram: { posts: 10, likes: 60, follows: 30, comments: 30, cooldownMinutes: 10 },
  facebook: { posts: 15, likes: 100, follows: 50, comments: 50, cooldownMinutes: 5 },
  linkedin: { posts: 5, likes: 50, follows: 30, comments: 20, cooldownMinutes: 15 },
  tiktok: { posts: 5, likes: 100, follows: 50, comments: 30, cooldownMinutes: 10 },
  youtube: { posts: 3, likes: 50, follows: 30, comments: 20, cooldownMinutes: 20 },
  threads: { posts: 15, likes: 80, follows: 40, comments: 40, cooldownMinutes: 5 },
  pinterest: { posts: 20, likes: 50, follows: 30, comments: 20, cooldownMinutes: 5 },
  reddit: { posts: 5, likes: 50, follows: 0, comments: 20, cooldownMinutes: 15 },
};

export function getPlatformLimits(platform: string) {
  return PLATFORM_DAILY_LIMITS[platform] || PLATFORM_DAILY_LIMITS.twitter;
}

/**
 * Check if a persona can post on a platform right now.
 * Returns { allowed, reason, todayCount, limit }
 */
export async function canPostNow(
  personaId: string,
  platform: string
): Promise<{ allowed: boolean; reason?: string; todayCount: number; limit: number }> {
  const limits = getPlatformLimits(platform);

  // Check account status
  const [account] = await db
    .select({ accountStatus: socialAccounts.accountStatus, lastUsedAt: socialAccounts.lastUsedAt })
    .from(socialAccounts)
    .where(and(
      eq(socialAccounts.personaId, personaId),
      eq(socialAccounts.platform, platform)
    ))
    .limit(1);

  if (!account) {
    return { allowed: false, reason: "Bu platform için hesap bulunamadı", todayCount: 0, limit: limits.posts };
  }

  if (account.accountStatus && account.accountStatus !== "active") {
    return { allowed: false, reason: `Hesap durumu: ${account.accountStatus}`, todayCount: 0, limit: limits.posts };
  }

  // Check cooldown
  if (account.lastUsedAt) {
    const elapsed = (Date.now() - new Date(account.lastUsedAt).getTime()) / 60000;
    if (elapsed < limits.cooldownMinutes) {
      const remaining = Math.ceil(limits.cooldownMinutes - elapsed);
      return { allowed: false, reason: `Cooldown: ${remaining} dakika bekleyin`, todayCount: 0, limit: limits.posts };
    }
  }

  // Check daily post count
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contentItems)
    .where(and(
      eq(contentItems.personaId, personaId),
      eq(contentItems.platform, platform),
      eq(contentItems.status, "published"),
      gte(contentItems.publishedAt, todayStart)
    ));

  const todayCount = count || 0;

  if (todayCount >= limits.posts) {
    return { allowed: false, reason: `Günlük limit aşıldı (${todayCount}/${limits.posts})`, todayCount, limit: limits.posts };
  }

  return { allowed: true, todayCount, limit: limits.posts };
}

/**
 * Calculate account health score (0-100).
 * Higher = healthier, lower = risky.
 */
export async function getAccountHealthScore(
  personaId: string,
  platform: string
): Promise<{ score: number; factors: Record<string, number> }> {
  const limits = getPlatformLimits(platform);

  // Get today's activity
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [{ publishedCount }] = await db
    .select({ publishedCount: sql<number>`count(*)::int` })
    .from(contentItems)
    .where(and(
      eq(contentItems.personaId, personaId),
      eq(contentItems.platform, platform),
      eq(contentItems.status, "published"),
      gte(contentItems.publishedAt, todayStart)
    ));

  const [{ failedCount }] = await db
    .select({ failedCount: sql<number>`count(*)::int` })
    .from(contentItems)
    .where(and(
      eq(contentItems.personaId, personaId),
      eq(contentItems.platform, platform),
      eq(contentItems.status, "failed"),
      gte(contentItems.createdAt, todayStart)
    ));

  // Check account status
  const [account] = await db
    .select({ accountStatus: socialAccounts.accountStatus })
    .from(socialAccounts)
    .where(and(
      eq(socialAccounts.personaId, personaId),
      eq(socialAccounts.platform, platform)
    ))
    .limit(1);

  const factors: Record<string, number> = {};

  // Activity ratio (how close to daily limit)
  const activityRatio = (publishedCount || 0) / limits.posts;
  factors.activityPressure = Math.max(0, 100 - Math.round(activityRatio * 100));

  // Error rate
  const totalAttempts = (publishedCount || 0) + (failedCount || 0);
  const errorRate = totalAttempts > 0 ? (failedCount || 0) / totalAttempts : 0;
  factors.reliability = Math.round((1 - errorRate) * 100);

  // Account status
  const statusScores: Record<string, number> = {
    active: 100,
    restricted: 30,
    suspended: 10,
    banned: 0,
  };
  factors.accountStatus = statusScores[account?.accountStatus || "active"] ?? 50;

  // Overall score (weighted average)
  const score = Math.round(
    factors.activityPressure * 0.3 +
    factors.reliability * 0.3 +
    factors.accountStatus * 0.4
  );

  return { score, factors };
}
