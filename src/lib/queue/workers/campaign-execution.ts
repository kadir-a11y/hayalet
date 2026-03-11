import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { resolvePersonasForCampaign } from "@/lib/services/campaign-service";
import { aiGenerationQueue, contentDeliveryQueue } from "../queues";

interface CampaignExecutionJob {
  campaignId: string;
  userId: string;
}

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min) * 60 * 1000; // minutes to ms
}

export function createCampaignExecutionWorker() {
  return new Worker<CampaignExecutionJob>(
    "campaign-execution",
    async (job: Job<CampaignExecutionJob>) => {
      const { campaignId } = job.data;

      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, campaignId))
        .limit(1);

      if (!campaign) throw new Error(`Campaign not found: ${campaignId}`);

      const targetTagIds = (campaign.targetTagIds as string[]) || [];
      const settings = (campaign.settings as any) || {};
      const delayMin = settings.delayMin || 1;
      const delayMax = settings.delayMax || 10;
      const maxPerPersona = settings.maxPerPersona || 1;

      // Resolve personas by tags
      const matchedPersonas = await resolvePersonasForCampaign(targetTagIds);
      console.log(`Campaign ${campaignId}: Found ${matchedPersonas.length} matching personas`);

      // Update campaign status
      await db
        .update(campaigns)
        .set({ status: "active", updatedAt: new Date() })
        .where(eq(campaigns.id, campaignId));

      // Generate content for each persona with random delays
      let jobIndex = 0;
      for (const persona of matchedPersonas) {
        for (let i = 0; i < maxPerPersona; i++) {
          const delay = randomDelay(delayMin, delayMax) + jobIndex * 30000; // stagger
          const jitter = Math.floor(Math.random() * 5 * 60 * 1000); // 0-5 min jitter

          await aiGenerationQueue.add(
            `campaign-${campaignId}-${persona.id}-${i}`,
            {
              personaId: persona.id,
              platform: campaign.platform || "twitter",
              contentType: "post",
              additionalInstructions: campaign.contentTemplate || undefined,
              campaignId,
              autoSchedule: true,
              scheduledAt: new Date(Date.now() + delay + jitter).toISOString(),
            },
            { delay: delay + jitter }
          );

          jobIndex++;
        }
      }

      console.log(`Campaign ${campaignId}: Queued ${jobIndex} AI generation jobs`);
    },
    {
      connection: redisConnection,
      concurrency: 2,
    }
  );
}
