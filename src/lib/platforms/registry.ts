import type { PlatformAdapter } from "./types";

const adapters = new Map<string, PlatformAdapter>();

export function registerPlatformAdapter(adapter: PlatformAdapter): void {
  adapters.set(adapter.platform, adapter);
}

export function getPlatformAdapter(platform: string): PlatformAdapter | undefined {
  return adapters.get(platform);
}

export function getRegisteredPlatforms(): string[] {
  return Array.from(adapters.keys());
}
