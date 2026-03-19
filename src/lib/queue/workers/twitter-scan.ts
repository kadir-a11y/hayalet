import { Worker, Job } from "bullmq";
import { redisConnection } from "../connection";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { captureWorkerError } from "@/lib/sentry";

interface TwitterScanJob {
  projectId: string;
}

export function createTwitterScanWorker() {
  return new Worker<TwitterScanJob>(
    "twitter-scan",
    async (job: Job<TwitterScanJob>) => {
      const { projectId } = job.data;

      try {
        // Fetch project with auto-scan enabled
        const [project] = await db
          .select()
          .from(projects)
          .where(and(
            eq(projects.id, projectId),
            sql`${projects.twitterAutoScan} = true`
          ))
          .limit(1);

        if (!project) {
          console.log(`[TwitterScan] Project ${projectId} not found or auto-scan disabled`);
          return;
        }

        const keywords = (project.keywords as string[]) || [];
        if (keywords.length === 0) {
          console.log(`[TwitterScan] Project ${projectId} has no keywords`);
          return;
        }

        // Call the existing twitter-scan API endpoint internally
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/projects/${projectId}/twitter-scan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "scan" }),
        });

        if (res.ok) {
          const result = await res.json();
          console.log(`[TwitterScan] Project ${projectId}: ${result.added || 0} new mentions`);
        } else {
          console.error(`[TwitterScan] API call failed for project ${projectId}: ${res.status}`);
        }
      } catch (error) {
        captureWorkerError(error, { worker: "twitter-scan", projectId });
        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 2,
    }
  );
}
