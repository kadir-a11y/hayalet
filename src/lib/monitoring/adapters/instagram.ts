import type { MonitoringAdapter, MonitoredTopicData, MonitoringSourceData, DiscoveredItemInput } from "../types";

interface InstagramMedia {
  id: string;
  caption?: string;
  permalink?: string;
  media_type?: string;
  timestamp?: string;
}

export const instagramAdapter: MonitoringAdapter = {
  type: "instagram",

  async fetch(topic: MonitoredTopicData, source: MonitoringSourceData): Promise<DiscoveredItemInput[]> {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) {
      console.warn("Instagram: INSTAGRAM_ACCESS_TOKEN not set, skipping");
      return [];
    }

    const config = source.config as {
      ig_user_id?: string;
      max_results?: number;
    };

    if (!config.ig_user_id) {
      console.error("Instagram: ig_user_id is required in source config");
      return [];
    }

    const userId = config.ig_user_id;
    const maxResults = config.max_results || 25;
    const results: DiscoveredItemInput[] = [];
    const baseUrl = "https://graph.facebook.com/v19.0";

    // Search for each keyword as a hashtag
    for (const keyword of topic.keywords) {
      const hashtag = keyword.replace(/^#/, "").replace(/\s+/g, "");

      try {
        // Step 1: Search for hashtag ID
        const searchUrl = `${baseUrl}/ig_hashtag_search?q=${encodeURIComponent(hashtag)}&user_id=${userId}&access_token=${accessToken}`;
        const searchResponse = await fetch(searchUrl);

        if (!searchResponse.ok) {
          console.error(`Instagram hashtag search failed for "${hashtag}": ${searchResponse.status}`);
          continue;
        }

        const searchData = await searchResponse.json();
        const hashtagId = searchData.data?.[0]?.id;

        if (!hashtagId) {
          console.warn(`Instagram: no hashtag found for "${hashtag}"`);
          continue;
        }

        // Step 2: Get recent media for hashtag
        const mediaUrl = `${baseUrl}/${hashtagId}/recent_media?user_id=${userId}&fields=id,caption,permalink,media_type,timestamp&limit=${maxResults}&access_token=${accessToken}`;
        const mediaResponse = await fetch(mediaUrl);

        if (!mediaResponse.ok) {
          console.error(`Instagram recent media failed for hashtag "${hashtag}": ${mediaResponse.status}`);
          continue;
        }

        const mediaData = await mediaResponse.json();
        const mediaItems = (mediaData.data || []) as InstagramMedia[];

        for (const media of mediaItems) {
          const caption = media.caption || "";
          results.push({
            externalId: `ig_${media.id}`,
            title: caption.slice(0, 100) || `Instagram ${media.media_type || "post"} ${media.id}`,
            summary: caption.slice(0, 500),
            url: media.permalink || `https://www.instagram.com/p/${media.id}`,
          });
        }
      } catch (err) {
        console.error(`Instagram error for hashtag "${hashtag}":`, err);
      }
    }

    return results;
  },
};
