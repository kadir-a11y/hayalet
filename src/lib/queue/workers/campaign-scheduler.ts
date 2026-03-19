import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { campaignQueue } from "../queues";
import { captureWorkerError } from "@/lib/sentry";

/**
 * Campaign Scheduler Worker
 * Runs every 5 minutes, checks for campaigns with scheduledAt <= now
 * and status = 'scheduled', then queues them for execution.
 */
export function createCampaignSchedulerWorker() {
  return new Worker(
    "campaign-scheduler",
    async (job: Job) => {
      try {
        const now = new Date();

        // Find campaigns that are scheduled and due
        const dueCampaigns = await db
          .select()
          .from(campaigns)
          .where(and(
            eq(campaigns.status, "scheduled"),
            lte(campaigns.scheduledAt, now)
          ));

        if (dueCampaigns.length === 0) {
          console.log("[CampaignScheduler] No due campaigns");
          return;
        }

        console.log(`[CampaignScheduler] Found ${dueCampaigns.length} due campaigns`);

        for (const campaign of dueCampaigns) {
          // Mark as active
          await db
            .update(campaigns)
            .set({ status: "active", updatedAt: now })
            .where(eq(campaigns.id, campaign.id));

          // Queue for execution
          await campaignQueue.add(
            `campaign-${campaign.id}`,
            {
              campaignId: campaign.id,
              userId: campaign.userId,
            }
          );

          console.log(`[CampaignScheduler] Queued campaign ${campaign.id}: ${campaign.name}`);
        }
      } catch (error) {
        captureWorkerError(error, { worker: "campaign-scheduler" });
        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 1,
    }
  );
}
