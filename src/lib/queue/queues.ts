import { Queue } from "bullmq";
import { redisConnection } from "./connection";

export const contentDeliveryQueue = new Queue("content-delivery", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});

export const aiGenerationQueue = new Queue("ai-generation", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 3000 },
  },
});

export const campaignQueue = new Queue("campaign-execution", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 1,
  },
});
