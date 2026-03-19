import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { workspacePublishingQueue } from "../queues";
import { db } from "@/lib/db";
import { contentItems, personas, socialAccounts, workspaceResponses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getPlatformAdapter } from "@/lib/platforms/registry";
import "@/lib/platforms/adapters";

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

      // Check account status before publishing
      const [account] = await db
        .select()
        .from(socialAccounts)
        .where(and(
          eq(socialAccounts.personaId, personaId),
          eq(socialAccounts.platform, platform)
        ))
        .limit(1);

      if (account && account.accountStatus && account.accountStatus !== "active") {
        const msg = `Account ${account.platformUsername || personaId} is ${account.accountStatus}, skipping publish`;
        console.log(`[Workspace] ${msg}`);
        await db
          .update(contentItems)
          .set({ status: "failed", errorMessage: msg, updatedAt: new Date() })
          .where(eq(contentItems.id, contentItemId));
        return;
      }

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
        const content = job.data.content;
        const adapter = getPlatformAdapter(platform);

        if (!adapter) {
          throw new Error(`No adapter registered for platform: ${platform}`);
        }

        const chunks = adapter.splitContent(content);
        const result = chunks.length === 1
          ? await adapter.post(personaId, chunks[0])
          : await adapter.postThread(personaId, chunks);

        if (!result.success) {
          throw new Error(result.error || `${platform} posting failed`);
        }

        await db
          .update(contentItems)
          .set({
            status: "published",
            publishedAt: new Date(),
            externalPostId: result.externalPostId || null,
            externalPostUrl: result.externalPostUrl || null,
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
            platformError: message,
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
