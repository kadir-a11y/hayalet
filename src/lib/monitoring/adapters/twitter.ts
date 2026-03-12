import type { MonitoringAdapter, MonitoredTopicData, MonitoringSourceData, DiscoveredItemInput } from "../types";

interface TwitterTweet {
  id: string;
  text: string;
  author_id?: string;
  created_at?: string;
}

export const twitterAdapter: MonitoringAdapter = {
  type: "twitter",

  async fetch(topic: MonitoredTopicData, source: MonitoringSourceData): Promise<DiscoveredItemInput[]> {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (!bearerToken) {
      console.warn("Twitter: TWITTER_BEARER_TOKEN not set, skipping");
      return [];
    }

    const config = source.config as {
      search_type?: "keyword" | "hashtag" | "mention";
      max_results?: number;
    };

    const searchType = config.search_type || "keyword";
    const maxResults = Math.min(Math.max(config.max_results || 10, 10), 100);
    const results: DiscoveredItemInput[] = [];

    // Build query based on search type
    let query: string;
    const keywords = topic.keywords;

    switch (searchType) {
      case "hashtag":
        query = keywords.map((k) => `#${k.replace(/^#/, "")}`).join(" OR ");
        break;
      case "mention":
        query = keywords.map((k) => `@${k.replace(/^@/, "")}`).join(" OR ");
        break;
      case "keyword":
      default:
        query = keywords.join(" OR ");
        break;
    }

    try {
      const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${maxResults}&tweet.fields=author_id,created_at`;

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${bearerToken}`,
        },
      });

      if (!response.ok) {
        console.error(`Twitter search failed: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const tweets = (data.data || []) as TwitterTweet[];

      for (const tweet of tweets) {
        results.push({
          externalId: `tw_${tweet.id}`,
          title: tweet.text.slice(0, 100),
          summary: tweet.text.slice(0, 500),
          url: `https://twitter.com/i/web/status/${tweet.id}`,
        });
      }
    } catch (err) {
      console.error("Twitter search error:", err);
    }

    return results;
  },
};
