import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { db } from "@/lib/db";
import { contentItems, personas, campaigns } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { generateContent } from "@/lib/ai/gemini";
import { buildContentPrompt } from "@/lib/ai/prompts";

interface AIGenerationJob {
  personaId: string;
  platform: string;
  contentType: string;
  topic?: string;
  additionalInstructions?: string;
  campaignId?: string;
  autoSchedule?: boolean;
  scheduledAt?: string;
}

/**
 * After each campaign job completes, check if all jobs are done
 * and update campaign status accordingly.
 */
async function checkCampaignCompletion(campaignId: string, success: boolean) {
  const field = success ? "completedJobs" : "failedJobs";

  // Atomically increment the counter
  const [campaign] = await db
    .update(campaigns)
    .set({
      settings: sql`jsonb_set(
        COALESCE(settings, '{}'::jsonb),
        ${`{${field}}`},
        (COALESCE((settings->>${field})::int, 0) + 1)::text::jsonb
      )`,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, campaignId))
    .returning();

  if (!campaign) return;

  const settings = (campaign.settings as Record<string, number>) || {};
  const total = settings.totalJobs || 0;
  const completed = settings.completedJobs || 0;
  const failed = settings.failedJobs || 0;

  if (completed + failed >= total && total > 0) {
    const finalStatus = failed > 0 ? "partially_failed" : "completed";
    await db
      .update(campaigns)
      .set({ status: finalStatus, updatedAt: new Date() })
      .where(eq(campaigns.id, campaignId));
    console.log(`Campaign ${campaignId}: ${finalStatus} (${completed} ok, ${failed} failed)`);
  }
}

export function createAIGenerationWorker() {
  return new Worker<AIGenerationJob>(
    "ai-generation",
    async (job: Job<AIGenerationJob>) => {
      const { personaId, platform, contentType, topic, additionalInstructions, campaignId } = job.data;

      try {
        const [persona] = await db
          .select()
          .from(personas)
          .where(eq(personas.id, personaId))
          .limit(1);

        if (!persona) throw new Error(`Persona not found: ${personaId}`);

        const prompt = buildContentPrompt(
          {
            name: persona.name,
            bio: persona.bio || undefined,
            personalityTraits: (persona.personalityTraits as string[]) || [],
            interests: (persona.interests as string[]) || [],
            behavioralPatterns: (persona.behavioralPatterns as any) || {},
            language: persona.language || "tr",
          },
          platform,
          contentType,
          topic,
          additionalInstructions
        );

        const content = await generateContent(prompt);

        const [item] = await db
          .insert(contentItems)
          .values({
            personaId,
            campaignId: campaignId || null,
            platform,
            contentType,
            content,
            status: job.data.autoSchedule ? "scheduled" : "draft",
            scheduledAt: job.data.scheduledAt ? new Date(job.data.scheduledAt) : null,
            aiGenerated: true,
            aiPrompt: prompt,
            aiModel: "gemini-2.5-flash-lite",
          })
          .returning();

        console.log(`AI content generated for persona ${personaId}: ${content.substring(0, 50)}...`);

        // Track campaign completion
        if (campaignId) {
          await checkCampaignCompletion(campaignId, true);
        }

        return item;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[AIGeneration] Job ${job.id} failed:`, {
          personaId,
          campaignId,
          error: message,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });

        // Track campaign failure
        if (campaignId) {
          await checkCampaignCompletion(campaignId, false).catch(() => {});
        }

        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 3,
    }
  );
}
