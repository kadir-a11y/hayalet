import type { MonitoringAdapter, MonitoredTopicData, MonitoringSourceData, DiscoveredItemInput } from "../types";
import crypto from "crypto";

function parseRssXml(xml: string): Array<{ title: string; link: string; description: string }> {
  const items: Array<{ title: string; link: string; description: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") || "";
    const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
    const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")?.replace(/<[^>]*>/g, "") || "";
    items.push({ title, link, description });
  }

  return items;
}

export const rssAdapter: MonitoringAdapter = {
  type: "rss",

  async fetch(_topic: MonitoredTopicData, source: MonitoringSourceData): Promise<DiscoveredItemInput[]> {
    const feedUrl = (source.config as { url?: string }).url;
    if (!feedUrl) {
      console.error("RSS adapter: no URL in config");
      return [];
    }

    const response = await fetch(feedUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HayaletBot/1.0)" },
    });

    if (!response.ok) {
      console.error(`RSS fetch failed for ${feedUrl}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    const items = parseRssXml(xml);

    return items.map((item) => ({
      externalId: crypto.createHash("md5").update(item.link || item.title).digest("hex"),
      title: item.title,
      summary: item.description.slice(0, 500),
      url: item.link,
    }));
  },
};
