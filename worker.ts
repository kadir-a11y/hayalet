import "dotenv/config";
import { initSentryForWorkers } from "./src/lib/sentry";

initSentryForWorkers();

import { createContentDeliveryWorker } from "./src/lib/queue/workers/content-delivery";
import { createAIGenerationWorker } from "./src/lib/queue/workers/ai-generation";
import { createCampaignExecutionWorker } from "./src/lib/queue/workers/campaign-execution";
import { createMonitoringWorker } from "./src/lib/queue/workers/monitoring";
import { createRelevanceScoringWorker } from "./src/lib/queue/workers/relevance-scoring";
import { createWorkspacePublishingWorker } from "./src/lib/queue/workers/workspace-publishing";
import { createOrganicActivityWorker } from "./src/lib/queue/workers/organic-activity";
import { monitoringQueue, organicActivityQueue } from "./src/lib/queue/queues";

console.log("Starting Persona workers...");

const contentWorker = createContentDeliveryWorker();
const aiWorker = createAIGenerationWorker();
const campaignWorker = createCampaignExecutionWorker();
const monitoringWorker = createMonitoringWorker();
const relevanceScoringWorker = createRelevanceScoringWorker();
const workspacePublishingWorker = createWorkspacePublishingWorker();
const organicActivityWorker = createOrganicActivityWorker();

// Schedule repeatable monitoring job every 15 minutes
monitoringQueue.add("monitoring-cron", {}, {
  repeat: { every: 15 * 60 * 1000 },
  jobId: "monitoring-cron",
});

// Schedule repeatable organic activity job every 30 minutes
organicActivityQueue.add("organic-activity-cron", {}, {
  repeat: { every: 30 * 60 * 1000 },
  jobId: "organic-activity-cron",
});

console.log("Workers started:");
console.log("  - content-delivery (concurrency: 5)");
console.log("  - ai-generation (concurrency: 3)");
console.log("  - campaign-execution (concurrency: 2)");
console.log("  - monitoring (concurrency: 3, every 15min)");
console.log("  - relevance-scoring (concurrency: 5)");
console.log("  - workspace-publishing (concurrency: 3)");
console.log("  - organic-activity (concurrency: 2, every 30min)");

// Graceful shutdown
async function shutdown() {
  console.log("Shutting down workers...");
  await Promise.all([
    contentWorker.close(),
    aiWorker.close(),
    campaignWorker.close(),
    monitoringWorker.close(),
    relevanceScoringWorker.close(),
    workspacePublishingWorker.close(),
    organicActivityWorker.close(),
  ]);
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
