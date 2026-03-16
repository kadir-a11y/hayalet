import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { workspacePublishingQueue } from "../queues";
import { db } from "@/lib/db";
import { contentItems, personas, workspaceResponses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface WorkspacePublishingJob {
  contentItemId: string;
  platform: string;
  content: string;
  personaId: string;
}

export function createWorkspacePublishingWorker() {
  return new Worker<WorkspacePublishingJob>(
    "workspace-publishing",
    async (job: Job<WorkspacePublishingJob>) => {
      const { contentItemId, platform, personaId } = job.data;

      // Check persona active hours
      const [persona] = await db
        .select()
        .from(personas)
        .where(eq(personas.id, personaId))
        .limit(1);

      if (persona) {
        const now = new Date();
        const personaHour = getPersonaLocalHour(now, persona.timezone || "Europe/Istanbul");
        const activeStart = persona.activeHoursStart ?? 9;
        const activeEnd = persona.activeHoursEnd ?? 23;

        if (personaHour < activeStart || personaHour >= activeEnd) {
          // Re-queue with delay until next active period
          const hoursUntilActive = activeStart > personaHour
            ? activeStart - personaHour
            : 24 - personaHour + activeStart;
          const delayMs = hoursUntilActive * 60 * 60 * 1000;

          console.log(
            `[Workspace] Persona ${persona.name} not in active hours (${personaHour}h), ` +
            `rescheduling in ${hoursUntilActive}h`
          );

          await workspacePublishingQueue.add(
            "workspace-publish-rescheduled",
            job.data,
            { delay: delayMs }
          );
          return;
        }
      }

      // Mark as publishing
      await db
        .update(contentItems)
        .set({ status: "publishing", updatedAt: new Date() })
        .where(eq(contentItems.id, contentItemId));

      try {
        // Simulate platform delivery
        console.log(
          `[Workspace] Publishing on ${platform} for persona ${personaId}: ` +
          `${job.data.content.substring(0, 50)}...`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mark as published
        await db
          .update(contentItems)
          .set({
            status: "published",
            publishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(contentItems.id, contentItemId));

        // Update workspace response
        await db
          .update(workspaceResponses)
          .set({
            status: "published",
            publishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(workspaceResponses.contentItemId, contentItemId));

        console.log(`[Workspace] Content ${contentItemId} published on ${platform}`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";

        await db
          .update(contentItems)
          .set({
            status: "failed",
            errorMessage: message,
            updatedAt: new Date(),
          })
          .where(eq(contentItems.id, contentItemId));

        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 3,
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
