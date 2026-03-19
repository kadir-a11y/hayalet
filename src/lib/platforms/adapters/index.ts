import { registerPlatformAdapter } from "../registry";
import { twitterAdapter } from "./twitter";
import {
  instagramAdapter,
  facebookAdapter,
  linkedinAdapter,
  tiktokAdapter,
  youtubeAdapter,
  threadsAdapter,
  pinterestAdapter,
  redditAdapter,
} from "./stub";

export function registerAllPlatformAdapters(): void {
  registerPlatformAdapter(twitterAdapter);
  registerPlatformAdapter(instagramAdapter);
  registerPlatformAdapter(facebookAdapter);
  registerPlatformAdapter(linkedinAdapter);
  registerPlatformAdapter(tiktokAdapter);
  registerPlatformAdapter(youtubeAdapter);
  registerPlatformAdapter(threadsAdapter);
  registerPlatformAdapter(pinterestAdapter);
  registerPlatformAdapter(redditAdapter);
}

// Auto-register on import
registerAllPlatformAdapters();
