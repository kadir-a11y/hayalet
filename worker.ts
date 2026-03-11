import "dotenv/config";
import { createContentDeliveryWorker } from "./src/lib/queue/workers/content-delivery";
import { createAIGenerationWorker } from "./src/lib/queue/workers/ai-generation";
import { createCampaignExecutionWorker } from "./src/lib/queue/workers/campaign-execution";

console.log("Starting Hayalet workers...");

const contentWorker = createContentDeliveryWorker();
const aiWorker = createAIGenerationWorker();
const campaignWorker = createCampaignExecutionWorker();

console.log("Workers started:");
console.log("  - content-delivery (concurrency: 5)");
console.log("  - ai-generation (concurrency: 3)");
console.log("  - campaign-execution (concurrency: 2)");

// Graceful shutdown
async function shutdown() {
  console.log("Shutting down workers...");
  await Promise.all([
    contentWorker.close(),
    aiWorker.close(),
    campaignWorker.close(),
  ]);
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
