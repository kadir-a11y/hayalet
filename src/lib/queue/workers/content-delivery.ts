import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { db } from "@/lib/db";
import { contentItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface ContentDeliveryJob {
  contentItemId: string;
  platform: string;
  content: string;
  personaId: string;
}

// Pluggable adapter pattern - each platform can have its own delivery logic
const platformAdapters: Record<string, (job: ContentDeliveryJob) => Promise<void>> = {
  twitter: async (job) => {
    // TODO: Implement Twitter API delivery
    console.log(`[Twitter] Delivering content for persona ${job.personaId}: ${job.content.substring(0, 50)}...`);
    // Simulate delivery delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },
  instagram: async (job) => {
    console.log(`[Instagram] Delivering content for persona ${job.personaId}: ${job.content.substring(0, 50)}...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },
  facebook: async (job) => {
    console.log(`[Facebook] Delivering content for persona ${job.personaId}: ${job.content.substring(0, 50)}...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },
  linkedin: async (job) => {
    console.log(`[LinkedIn] Delivering content for persona ${job.personaId}: ${job.content.substring(0, 50)}...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },
  tiktok: async (job) => {
    console.log(`[TikTok] Delivering content for persona ${job.personaId}: ${job.content.substring(0, 50)}...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },
};

export function createContentDeliveryWorker() {
  return new Worker<ContentDeliveryJob>(
    "content-delivery",
    async (job: Job<ContentDeliveryJob>) => {
      const { contentItemId, platform } = job.data;

      // Mark as publishing
      await db
        .update(contentItems)
        .set({ status: "publishing", updatedAt: new Date() })
        .where(eq(contentItems.id, contentItemId));

      try {
        const adapter = platformAdapters[platform];
        if (!adapter) {
          throw new Error(`No adapter for platform: ${platform}`);
        }

        await adapter(job.data);

        // Mark as published
        await db
          .update(contentItems)
          .set({
            status: "published",
            publishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(contentItems.id, contentItemId));

        console.log(`Content ${contentItemId} published successfully on ${platform}`);
      } catch (error: any) {
        // Mark as failed
        await db
          .update(contentItems)
          .set({
            status: "failed",
            errorMessage: error.message,
            updatedAt: new Date(),
          })
          .where(eq(contentItems.id, contentItemId));

        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );
}
