export interface PostResult {
  success: boolean;
  externalPostId?: string;
  externalPostUrl?: string;
  error?: string;
}

export interface PostOptions {
  mediaIds?: string[];
  replyToId?: string;
}

export interface MetricsResult {
  likes: number;
  retweets: number;
  replies: number;
  impressions: number;
  quotes: number;
}

export interface PlatformAdapter {
  readonly platform: string;

  post(personaId: string, content: string, options?: PostOptions): Promise<PostResult>;

  postThread(personaId: string, texts: string[]): Promise<PostResult>;

  deletePost(personaId: string, postId: string): Promise<boolean>;

  getMetrics(personaId: string, postId: string): Promise<MetricsResult>;

  getBatchMetrics(personaId: string, postIds: string[]): Promise<Map<string, MetricsResult>>;

  splitContent(text: string): string[];
}
