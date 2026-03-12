import "dotenv/config";
import { createContentDeliveryWorker } from "./src/lib/queue/workers/content-delivery";
import { createAIGenerationWorker } from "./src/lib/queue/workers/ai-generation";
import { createCampaignExecutionWorker } from "./src/lib/queue/workers/campaign-execution";
import { createMonitoringWorker } from "./src/lib/queue/workers/monitoring";
import { createRelevanceScoringWorker } from "./src/lib/queue/workers/relevance-scoring";
import { monitoringQueue } from "./src/lib/queue/queues";

console.log("Starting Persona workers...");

const contentWorker = createContentDeliveryWorker();
const aiWorker = createAIGenerationWorker();
const campaignWorker = createCampaignExecutionWorker();
const monitoringWorker = createMonitoringWorker();
const relevanceScoringWorker = createRelevanceScoringWorker();

// Schedule repeatable monitoring job every 15 minutes
monitoringQueue.add("monitoring-cron", {}, {
  repeat: { every: 15 * 60 * 1000 },
  jobId: "monitoring-cron",
});

console.log("Workers started:");
console.log("  - content-delivery (concurrency: 5)");
console.log("  - ai-generation (concurrency: 3)");
console.log("  - campaign-execution (concurrency: 2)");
console.log("  - monitoring (concurrency: 3, every 15min)");
console.log("  - relevance-scoring (concurrency: 5)");

// Graceful shutdown
async function shutdown() {
  console.log("Shutting down workers...");
  await Promise.all([
    contentWorker.close(),
    aiWorker.close(),
    campaignWorker.close(),
    monitoringWorker.close(),
    relevanceScoringWorker.close(),
  ]);
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
