import type { PlatformAdapter, PostResult, PostOptions, MetricsResult } from "../types";
import { postTweet, postThread, deleteTweet, splitIntoThread } from "../twitter/posting";
import { getTweetMetrics, getBatchTweetMetrics } from "../twitter/metrics";
import { getTwitterClient } from "../twitter/client";

export const twitterAdapter: PlatformAdapter = {
  platform: "twitter",

  async post(personaId: string, content: string, options?: PostOptions): Promise<PostResult> {
    return postTweet(personaId, content, options?.mediaIds);
  },

  async postThread(personaId: string, texts: string[]): Promise<PostResult> {
    return postThread(personaId, texts);
  },

  async deletePost(personaId: string, postId: string): Promise<boolean> {
    const client = await getTwitterClient(personaId);
    return deleteTweet(client, postId);
  },

  async getMetrics(personaId: string, postId: string): Promise<MetricsResult> {
    return getTweetMetrics(personaId, postId);
  },

  async getBatchMetrics(personaId: string, postIds: string[]): Promise<Map<string, MetricsResult>> {
    return getBatchTweetMetrics(personaId, postIds);
  },

  splitContent(text: string): string[] {
    return splitIntoThread(text);
  },
};
