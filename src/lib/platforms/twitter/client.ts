import { TwitterApi } from "twitter-api-v2";
import { db } from "@/lib/db";
import { socialAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { decryptToken, isEncryptionConfigured } from "@/lib/services/token-service";

/**
 * Get an authenticated Twitter client for a persona's Twitter account.
 */
export async function getTwitterClient(personaId: string): Promise<TwitterApi> {
  const [account] = await db
    .select()
    .from(socialAccounts)
    .where(
      and(
        eq(socialAccounts.personaId, personaId),
        eq(socialAccounts.platform, "twitter"),
        eq(socialAccounts.isActive, true)
      )
    )
    .limit(1);

  if (!account) {
    throw new Error(`No active Twitter account found for persona ${personaId}`);
  }

  if (!account.accessToken || !account.accessTokenSecret) {
    throw new Error(`Twitter tokens missing for persona ${personaId}. Please reconnect.`);
  }

  const appKey = process.env.TWITTER_API_KEY;
  const appSecret = process.env.TWITTER_API_SECRET;

  if (!appKey || !appSecret) {
    throw new Error("TWITTER_API_KEY and TWITTER_API_SECRET must be set in environment");
  }

  // Decrypt tokens if encryption is configured
  const accessToken = isEncryptionConfigured()
    ? decryptToken(account.accessToken)
    : account.accessToken;

  const accessSecret = isEncryptionConfigured()
    ? decryptToken(account.accessTokenSecret)
    : account.accessTokenSecret;

  const client = new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret,
  });

  // Update last used timestamp
  await db
    .update(socialAccounts)
    .set({ lastUsedAt: new Date(), updatedAt: new Date() })
    .where(eq(socialAccounts.id, account.id));

  return client;
}

/**
 * Get the app-level Twitter client (for OAuth flow initiation).
 */
export function getAppTwitterClient(): TwitterApi {
  const appKey = process.env.TWITTER_API_KEY;
  const appSecret = process.env.TWITTER_API_SECRET;

  if (!appKey || !appSecret) {
    throw new Error("TWITTER_API_KEY and TWITTER_API_SECRET must be set");
  }

  return new TwitterApi({ appKey, appSecret });
}
