import type { MonitoringAdapter, MonitoredTopicData, MonitoringSourceData, DiscoveredItemInput } from "../types";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getRedditToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Reddit: REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET not set");
    return null;
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "HayaletBot/1.0",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    console.error(`Reddit token request failed: ${response.status}`);
    return null;
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

interface RedditPost {
  data: {
    id: string;
    title: string;
    selftext: string;
    permalink: string;
    ups: number;
    url: string;
    subreddit: string;
  };
}

export const redditAdapter: MonitoringAdapter = {
  type: "reddit",

  async fetch(topic: MonitoredTopicData, source: MonitoringSourceData): Promise<DiscoveredItemInput[]> {
    const token = await getRedditToken();
    if (!token) return [];

    const config = source.config as {
      subreddits?: string[];
      subreddit?: string;
      sort?: string;
      min_upvotes?: number;
    };

    const subreddits = config.subreddits || (config.subreddit ? [config.subreddit] : []);
    const sort = config.sort || "hot";
    const minUpvotes = config.min_upvotes || 0;
    const results: DiscoveredItemInput[] = [];

    const headers = {
      "Authorization": `Bearer ${token}`,
      "User-Agent": "HayaletBot/1.0",
    };

    if (subreddits.length > 0) {
      // Subreddit mode: fetch posts from each subreddit
      for (const sub of subreddits) {
        try {
          const response = await fetch(
            `https://oauth.reddit.com/r/${sub}/${sort}.json?limit=25`,
            { headers }
          );

          if (!response.ok) {
            console.error(`Reddit fetch r/${sub} failed: ${response.status}`);
            continue;
          }

          const data = await response.json();
          const posts = (data.data?.children || []) as RedditPost[];

          for (const post of posts) {
            if (post.data.ups < minUpvotes) continue;

            results.push({
              externalId: `reddit_${post.data.id}`,
              title: post.data.title,
              summary: (post.data.selftext || "").slice(0, 500),
              url: `https://reddit.com${post.data.permalink}`,
            });
          }
        } catch (err) {
          console.error(`Reddit error for r/${sub}:`, err);
        }
      }
    } else {
      // Keyword search mode
      const query = topic.keywords.join("+");
      try {
        const response = await fetch(
          `https://oauth.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=25`,
          { headers }
        );

        if (!response.ok) {
          console.error(`Reddit search failed: ${response.status}`);
          return [];
        }

        const data = await response.json();
        const posts = (data.data?.children || []) as RedditPost[];

        for (const post of posts) {
          if (post.data.ups < minUpvotes) continue;

          results.push({
            externalId: `reddit_${post.data.id}`,
            title: post.data.title,
            summary: (post.data.selftext || "").slice(0, 500),
            url: `https://reddit.com${post.data.permalink}`,
          });
        }
      } catch (err) {
        console.error("Reddit search error:", err);
      }
    }

    return results;
  },
};
