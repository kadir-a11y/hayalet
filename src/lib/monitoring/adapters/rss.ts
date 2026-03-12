import type { MonitoringAdapter, MonitoredTopicData, MonitoringSourceData, DiscoveredItemInput } from "../types";
import crypto from "crypto";
import { parseFeedXml, matchesKeywords } from "../utils";

export const rssAdapter: MonitoringAdapter = {
  type: "rss",

  async fetch(topic: MonitoredTopicData, source: MonitoringSourceData): Promise<DiscoveredItemInput[]> {
    const config = source.config as { url?: string; feed_url?: string; keyword_filter?: boolean; max_items?: number };
    const feedUrl = config.feed_url || config.url;
    if (!feedUrl) {
      console.error("RSS adapter: no URL in config");
      return [];
    }

    const keywordFilter = config.keyword_filter !== false;
    const maxItems = config.max_items || 30;

    const response = await fetch(feedUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HayaletBot/1.0)" },
    });

    if (!response.ok) {
      console.error(`RSS fetch failed for ${feedUrl}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    let items = parseFeedXml(xml);

    // Apply keyword filter if enabled
    if (keywordFilter && topic.keywords.length > 0) {
      items = items.filter((item) =>
        matchesKeywords(`${item.title} ${item.description}`, topic.keywords)
      );
    }

    return items.slice(0, maxItems).map((item) => ({
      externalId: crypto.createHash("md5").update(item.link || item.title).digest("hex"),
      title: item.title,
      summary: item.description.slice(0, 500),
      url: item.link,
    }));
  },
};
