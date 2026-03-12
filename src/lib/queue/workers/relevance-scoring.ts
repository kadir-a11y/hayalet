import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { db } from "@/lib/db";
import { discoveredItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateContent } from "@/lib/ai/gemini";

interface RelevanceScoringJob {
  discoveredItemId: string;
  topicKeywords: string[];
  title: string;
  summary: string;
}

export function createRelevanceScoringWorker() {
  return new Worker<RelevanceScoringJob>(
    "relevance-scoring",
    async (job: Job<RelevanceScoringJob>) => {
      const { discoveredItemId, topicKeywords, title, summary } = job.data;

      let score = 0;

      try {
        const prompt = `Rate the relevance of this content to the following keywords on a scale of 0-100.
Keywords: ${topicKeywords.join(", ")}

Content title: ${title}
Content summary: ${summary}

Respond with ONLY a number between 0 and 100. Nothing else.`;

        const result = await generateContent(prompt);
        const parsed = parseInt(result.trim(), 10);
        score = isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));
      } catch (err) {
        console.error(`AI scoring failed for item ${discoveredItemId}, using keyword matching:`, err);
        // Fallback: simple keyword matching
        const text = `${title} ${summary}`.toLowerCase();
        const matches = topicKeywords.filter((kw) => text.includes(kw.toLowerCase()));
        score = Math.min(100, Math.round((matches.length / Math.max(topicKeywords.length, 1)) * 100));
      }

      await db
        .update(discoveredItems)
        .set({ relevanceScore: score })
        .where(eq(discoveredItems.id, discoveredItemId));

      console.log(`Scored item ${discoveredItemId}: ${score}/100`);
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );
}
