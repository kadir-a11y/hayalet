import type { MonitoringAdapter } from "../types";
import { googleNewsAdapter } from "./google-news";
import { rssAdapter } from "./rss";
import { redditAdapter } from "./reddit";
import { youtubeAdapter } from "./youtube";

const adapters = new Map<string, MonitoringAdapter>();

// Register all adapters
adapters.set("google_news", googleNewsAdapter);
adapters.set("rss", rssAdapter);
adapters.set("reddit", redditAdapter);
adapters.set("youtube", youtubeAdapter);

export function registerAdapter(adapter: MonitoringAdapter) {
  adapters.set(adapter.type, adapter);
}

export function getAdapter(sourceType: string): MonitoringAdapter | undefined {
  return adapters.get(sourceType);
}

export function getRegisteredAdapterTypes(): string[] {
  return Array.from(adapters.keys());
}
