import type { MonitoringAdapter, MonitoredTopicData, MonitoringSourceData, DiscoveredItemInput } from "../types";

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
  };
}

export const youtubeAdapter: MonitoringAdapter = {
  type: "youtube",

  async fetch(topic: MonitoredTopicData, source: MonitoringSourceData): Promise<DiscoveredItemInput[]> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.error("YouTube: YOUTUBE_API_KEY not set");
      return [];
    }

    const config = source.config as {
      search_mode?: string;
      channel_ids?: string[];
      channelId?: string;
      region_code?: string;
      relevance_language?: string;
      max_results?: number;
    };

    const maxResults = config.max_results || 10;
    const regionCode = config.region_code || topic.language?.toUpperCase() || "TR";
    const relevanceLanguage = config.relevance_language || topic.language || "tr";
    const results: DiscoveredItemInput[] = [];

    const channelIds = config.channel_ids || (config.channelId ? [config.channelId] : []);

    if (channelIds.length > 0) {
      // Channel mode: fetch latest videos from channels
      for (const channelId of channelIds) {
        try {
          const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=${maxResults}&key=${apiKey}`;

          const response = await fetch(url);
          if (!response.ok) {
            console.error(`YouTube channel ${channelId} failed: ${response.status}`);
            continue;
          }

          const data = await response.json();
          const items = (data.items || []) as YouTubeSearchItem[];

          for (const item of items) {
            results.push({
              externalId: `yt_${item.id.videoId}`,
              title: item.snippet.title,
              summary: item.snippet.description.slice(0, 500),
              url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            });
          }
        } catch (err) {
          console.error(`YouTube channel error ${channelId}:`, err);
        }
      }
    } else {
      // Keyword search mode
      const query = topic.keywords.join(" ");
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=date&maxResults=${maxResults}&regionCode=${regionCode}&relevanceLanguage=${relevanceLanguage}&key=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
          console.error(`YouTube search failed: ${response.status}`);
          return [];
        }

        const data = await response.json();
        const items = (data.items || []) as YouTubeSearchItem[];

        for (const item of items) {
          results.push({
            externalId: `yt_${item.id.videoId}`,
            title: item.snippet.title,
            summary: item.snippet.description.slice(0, 500),
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          });
        }
      } catch (err) {
        console.error("YouTube search error:", err);
      }
    }

    return results;
  },
};
