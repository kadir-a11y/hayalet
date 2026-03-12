import type { MonitoringAdapter, MonitoredTopicData, MonitoringSourceData, DiscoveredItemInput } from "../types";
import crypto from "crypto";
import { parseRssXml } from "../utils";

export const googleNewsAdapter: MonitoringAdapter = {
  type: "google_news",

  async fetch(topic: MonitoredTopicData, source: MonitoringSourceData): Promise<DiscoveredItemInput[]> {
    const config = source.config as { country?: string; max_results?: number };
    const query = topic.keywords.join("+OR+");
    const lang = topic.language || "tr";
    const country = config.country || lang.toUpperCase();
    const maxResults = config.max_results || 20;

    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${lang}&gl=${country}&ceid=${country}:${lang}`;

    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HayaletBot/1.0)" },
    });

    if (!response.ok) {
      console.error(`Google News fetch failed: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    const items = parseRssXml(xml);

    return items.slice(0, maxResults).map((item) => ({
      externalId: crypto.createHash("md5").update(item.link).digest("hex"),
      title: item.title,
      summary: item.description.slice(0, 500),
      url: item.link,
    }));
  },
};
