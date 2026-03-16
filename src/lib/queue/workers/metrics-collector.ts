import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { metricsCollectionQueue } from "../queues";
import { db } from "@/lib/db";
import { contentItems, engagementMetrics, socialAccounts } from "@/lib/db/schema";
import { eq, and, isNotNull, inArray } from "drizzle-orm";
import { getBatchTweetMetrics } from "@/lib/platforms/twitter";

const BATCH_SIZE = 100;

interface MetricsCollectionJob {
  platform?: string;
}

/**
 * Metrics collector worker — collects engagement metrics from platform APIs
 * for all published content with external post IDs.
 *
 * Designed to run as a BullMQ repeatable job every 6 hours.
 */
export function createMetricsCollectorWorker() {
  return new Worker<MetricsCollectionJob>(
    "metrics-collection",
    async (job: Job<MetricsCollectionJob>) => {
      const platform = job.data.platform || "twitter";

      try {
        if (platform === "twitter") {
          await collectTwitterMetrics(job);
        } else {
          console.log(`[MetricsCollector] Platform ${platform} not yet supported`);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[MetricsCollector] Job ${job.id} failed:`, {
          platform,
          error: message,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 1,
    }
  );
}

/**
 * Collect metrics for all published Twitter content.
 * Groups content by persona to minimize API client creation.
 */
async function collectTwitterMetrics(job: Job) {
  // Get all published content items with external post IDs on Twitter
  const publishedItems = await db
    .select({
      id: contentItems.id,
      personaId: contentItems.personaId,
      externalPostId: contentItems.externalPostId,
      platform: contentItems.platform,
    })
    .from(contentItems)
    .where(
      and(
        eq(contentItems.platform, "twitter"),
        eq(contentItems.status, "published"),
        isNotNull(contentItems.externalPostId)
      )
    );

  if (publishedItems.length === 0) {
    console.log("[MetricsCollector] No published Twitter content to collect metrics for");
    return;
  }

  // Group by persona
  const byPersona = new Map<string, typeof publishedItems>();
  for (const item of publishedItems) {
    const list = byPersona.get(item.personaId) || [];
    list.push(item);
    byPersona.set(item.personaId, list);
  }

  let totalCollected = 0;
  let totalFailed = 0;

  for (const [personaId, items] of byPersona) {
    // Check if persona has an active Twitter account
    const [account] = await db
      .select({ id: socialAccounts.id })
      .from(socialAccounts)
      .where(
        and(
          eq(socialAccounts.personaId, personaId),
          eq(socialAccounts.platform, "twitter"),
          eq(socialAccounts.isActive, true)
        )
      )
      .limit(1);

    if (!account) {
      console.log(`[MetricsCollector] Persona ${personaId}: no active Twitter account, skipping ${items.length} items`);
      continue;
    }

    // Process in batches
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      const tweetIds = batch.map((item) => item.externalPostId!);

      try {
        const metricsMap = await getBatchTweetMetrics(personaId, tweetIds);

        // Insert metrics for each tweet
        const metricsToInsert = [];
        for (const item of batch) {
          const m = metricsMap.get(item.externalPostId!);
          if (!m) continue;

          const totalEngagement = m.likes + m.retweets + m.replies;
          const engagementRate = m.impressions > 0
            ? ((totalEngagement / m.impressions) * 100).toFixed(2)
            : "0.00";

          metricsToInsert.push({
            contentItemId: item.id,
            platform: "twitter" as const,
            likes: m.likes,
            comments: m.replies,
            shares: m.retweets + m.quotes,
            views: m.impressions,
            reach: m.impressions,
            engagementRate,
            collectedAt: new Date(),
          });
        }

        if (metricsToInsert.length > 0) {
          await db.insert(engagementMetrics).values(metricsToInsert);
          totalCollected += metricsToInsert.length;
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[MetricsCollector] Batch failed for persona ${personaId}:`, message);
        totalFailed += batch.length;
      }
    }
  }

  console.log(
    `[MetricsCollector] Done: ${totalCollected} metrics collected, ${totalFailed} failed ` +
    `(${byPersona.size} personas, ${publishedItems.length} items)`
  );

  await job.updateProgress(100);
}

/**
 * Schedule the metrics collection to run every 6 hours.
 * Call this once during application startup.
 */
export async function scheduleMetricsCollection() {
  // Remove existing repeatable jobs to avoid duplicates
  const repeatableJobs = await metricsCollectionQueue.getRepeatableJobs();
  for (const rjob of repeatableJobs) {
    await metricsCollectionQueue.removeRepeatableByKey(rjob.key);
  }

  // Add repeatable job — every 6 hours
  await metricsCollectionQueue.add(
    "collect-metrics",
    { platform: "twitter" },
    {
      repeat: {
        every: 6 * 60 * 60 * 1000, // 6 hours
      },
    }
  );

  console.log("[MetricsCollector] Scheduled: every 6 hours");
}
