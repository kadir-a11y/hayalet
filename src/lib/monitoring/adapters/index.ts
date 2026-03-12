import type { MonitoringAdapter } from "../types";
import { googleNewsAdapter } from "./google-news";
import { rssAdapter } from "./rss";

const adapters = new Map<string, MonitoringAdapter>();

// Register free adapters by default
adapters.set("google_news", googleNewsAdapter);
adapters.set("rss", rssAdapter);

export function registerAdapter(adapter: MonitoringAdapter) {
  adapters.set(adapter.type, adapter);
}

export function getAdapter(sourceType: string): MonitoringAdapter | undefined {
  return adapters.get(sourceType);
}

export function getRegisteredAdapterTypes(): string[] {
  return Array.from(adapters.keys());
}
