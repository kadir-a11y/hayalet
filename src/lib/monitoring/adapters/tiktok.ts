import type { MonitoringAdapter, MonitoredTopicData, MonitoringSourceData, DiscoveredItemInput } from "../types";

interface TikTokVideo {
  id: string;
  video_description: string;
  share_url: string;
  username?: string;
  create_time?: number;
}

export const tiktokAdapter: MonitoringAdapter = {
  type: "tiktok",

  async fetch(topic: MonitoredTopicData, source: MonitoringSourceData): Promise<DiscoveredItemInput[]> {
    const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
    if (!accessToken) {
      console.warn("TikTok: TIKTOK_ACCESS_TOKEN not set, skipping");
      return [];
    }

    const config = source.config as {
      max_results?: number;
    };

    const maxResults = config.max_results || 10;
    const results: DiscoveredItemInput[] = [];

    const query = topic.keywords.join(" ");

    try {
      const response = await fetch("https://open.tiktokapis.com/v2/research/video/query/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: {
            and: [
              {
                field_name: "keyword",
                operation: "IN",
                field_values: topic.keywords,
              },
            ],
          },
          max_count: maxResults,
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          end_date: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        console.error(`TikTok search failed: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const videos = (data.data?.videos || []) as TikTokVideo[];

      for (const video of videos) {
        const description = video.video_description || "";
        results.push({
          externalId: `tiktok_${video.id}`,
          title: description.slice(0, 100) || `TikTok video ${video.id}`,
          summary: description.slice(0, 500),
          url: video.share_url || `https://www.tiktok.com/video/${video.id}`,
        });
      }
    } catch (err) {
      console.error("TikTok search error:", err);
    }

    return results;
  },
};
