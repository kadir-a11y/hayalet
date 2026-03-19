import type { PlatformAdapter, PostResult, PostOptions, MetricsResult } from "../types";

function createStubAdapter(platform: string): PlatformAdapter {
  return {
    platform,

    async post(_personaId: string, content: string, _options?: PostOptions): Promise<PostResult> {
      console.log(`[${platform}] Stub post: ${content.substring(0, 50)}...`);
      return {
        success: true,
        externalPostId: `stub-${platform}-${Date.now()}`,
      };
    },

    async postThread(_personaId: string, texts: string[]): Promise<PostResult> {
      console.log(`[${platform}] Stub thread: ${texts.length} parts`);
      return {
        success: true,
        externalPostId: `stub-${platform}-thread-${Date.now()}`,
      };
    },

    async deletePost(_personaId: string, _postId: string): Promise<boolean> {
      console.log(`[${platform}] Stub delete not implemented`);
      return false;
    },

    async getMetrics(_personaId: string, _postId: string): Promise<MetricsResult> {
      return { likes: 0, retweets: 0, replies: 0, impressions: 0, quotes: 0 };
    },

    async getBatchMetrics(_personaId: string, postIds: string[]): Promise<Map<string, MetricsResult>> {
      const results = new Map<string, MetricsResult>();
      for (const id of postIds) {
        results.set(id, { likes: 0, retweets: 0, replies: 0, impressions: 0, quotes: 0 });
      }
      return results;
    },

    splitContent(text: string): string[] {
      return [text];
    },
  };
}

export const instagramAdapter = createStubAdapter("instagram");
export const facebookAdapter = createStubAdapter("facebook");
export const linkedinAdapter = createStubAdapter("linkedin");
export const tiktokAdapter = createStubAdapter("tiktok");
export const youtubeAdapter = createStubAdapter("youtube");
export const threadsAdapter = createStubAdapter("threads");
export const pinterestAdapter = createStubAdapter("pinterest");
export const redditAdapter = createStubAdapter("reddit");
