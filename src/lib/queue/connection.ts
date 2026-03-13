import type { ConnectionOptions } from "bullmq";

const redisUrl = new URL(process.env.REDIS_URL || "redis://localhost:6379");

export const redisConnection: ConnectionOptions = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port || "6379"),
  ...(redisUrl.password ? { password: redisUrl.password } : {}),
  ...(redisUrl.username && redisUrl.username !== "default" ? { username: redisUrl.username } : {}),
  maxRetriesPerRequest: null,
};
