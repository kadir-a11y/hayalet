import type { ConnectionOptions } from "bullmq";

const redisUrl = new URL(process.env.REDIS_URL || "redis://localhost:6379");

export const redisConnection: ConnectionOptions = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port || "6379"),
  maxRetriesPerRequest: null,
};
