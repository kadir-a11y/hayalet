import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { db } from "@/lib/db";
import {
  organicActivityConfig,
  organicActivityLog,
  personas,
  projectMentions,
} from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { generateContent } from "@/lib/ai/gemini";
import { buildOrganicActivityPrompt } from "@/lib/ai/prompts";

interface OrganicActivityJob {
  configId?: string; // if specified, only process this config
}

export function createOrganicActivityWorker() {
  return new Worker<OrganicActivityJob>(
    "organic-activity",
    async (job: Job<OrganicActivityJob>) => {
      const { configId } = job.data;

      try {
      // Fetch active configs
      const conditions = [eq(organicActivityConfig.isActive, true)];
      if (configId) {
        conditions.push(eq(organicActivityConfig.id, configId));
      }

      const configs = await db
        .select({
          config: organicActivityConfig,
          persona: personas,
        })
        .from(organicActivityConfig)
        .innerJoin(personas, eq(organicActivityConfig.personaId, personas.id))
        .where(and(...conditions));

      console.log(`[Organic] Processing ${configs.length} active configs`);

      let totalActions = 0;

      for (const { config, persona } of configs) {
        // Check persona active hours
        const now = new Date();
        const personaHour = getPersonaLocalHour(now, persona.timezone || "Europe/Istanbul");
        const activeStart = persona.activeHoursStart ?? 9;
        const activeEnd = persona.activeHoursEnd ?? 23;

        if (personaHour < activeStart || personaHour >= activeEnd) {
          console.log(`[Organic] Skipping ${persona.name} - outside active hours`);
          continue;
        }

        // Check daily quota
        const [todayCount] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(organicActivityLog)
          .where(
            and(
              eq(organicActivityLog.configId, config.id),
              sql`${organicActivityLog.createdAt} >= date_trunc('day', now())`
            )
          );

        const dailyMax = config.frequencyMax ?? 8;
        if ((todayCount?.count ?? 0) >= dailyMax) {
          console.log(`[Organic] ${persona.name} daily quota reached (${dailyMax})`);
          continue;
        }

        // Pick random activity type
        const activityTypes = (config.activityTypes as string[]) || ["like"];
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];

        // Get a random recent mention from the project for targeting
        const [targetMention] = await db
          .select()
          .from(projectMentions)
          .where(eq(projectMentions.projectId, config.projectId))
          .orderBy(sql`random()`)
          .limit(1);

        let generatedContent: string | undefined;

        // Generate content for comment types
        if (activityType === "positive_comment" && targetMention) {
          try {
            const prompt = buildOrganicActivityPrompt(
              {
                name: persona.name,
                bio: persona.bio || undefined,
                personalityTraits: (persona.personalityTraits as string[]) || [],
                interests: (persona.interests as string[]) || [],
                behavioralPatterns: (persona.behavioralPatterns as Record<string, string>) || {},
                language: persona.language || "tr",
                gender: persona.gender || undefined,
                country: persona.country || undefined,
                city: persona.city || undefined,
              },
              config.platform,
              activityType,
              targetMention.content
            );

            if (prompt) {
              generatedContent = await generateContent(prompt);
            }
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.error(`[Organic] AI generation failed for ${persona.name}:`, message);
          }
        }

        // Log the activity
        await db.insert(organicActivityLog).values({
          configId: config.id,
          projectId: config.projectId,
          personaId: persona.id,
          activityType,
          platform: config.platform,
          targetUrl: targetMention?.sourceUrl || null,
          targetContent: targetMention?.content || null,
          generatedContent: generatedContent || null,
          status: "completed",
          executedAt: new Date(),
        });

        totalActions++;
        console.log(
          `[Organic] ${persona.name}: ${activityType} on ${config.platform}`
        );
      }

      console.log(`[Organic] Completed: ${totalActions} actions`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[OrganicActivity] Job ${job.id} failed:`, {
          configId,
          error: message,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 2,
    }
  );
}

function getPersonaLocalHour(date: Date, timezone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    });
    return parseInt(formatter.format(date), 10);
  } catch {
    return date.getUTCHours();
  }
}
