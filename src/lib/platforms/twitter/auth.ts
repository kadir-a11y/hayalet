import { db } from "@/lib/db";
import { socialAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAppTwitterClient, getTwitterClient } from "./client";
import { encryptToken, isEncryptionConfigured } from "@/lib/services/token-service";

interface OAuthRequestToken {
  oauthToken: string;
  oauthTokenSecret: string;
  authUrl: string;
}

/**
 * Generate an OAuth 1.0a authorization link for a persona to connect Twitter.
 */
export async function generateAuthLink(callbackUrl: string): Promise<OAuthRequestToken> {
  const client = getAppTwitterClient();
  const { url, oauth_token, oauth_token_secret } = await client.generateAuthLink(callbackUrl, {
    linkMode: "authorize",
  });

  return {
    oauthToken: oauth_token,
    oauthTokenSecret: oauth_token_secret,
    authUrl: url,
  };
}

/**
 * Handle the OAuth callback — exchange verifier for access tokens and save to DB.
 */
export async function handleCallback(
  oauthToken: string,
  oauthTokenSecret: string,
  oauthVerifier: string,
  personaId: string
): Promise<{ screenName: string; userId: string }> {
  const appKey = process.env.TWITTER_API_KEY!;
  const appSecret = process.env.TWITTER_API_SECRET!;

  const { default: TwitterApiImport } = await import("twitter-api-v2");
  const tempClient = new TwitterApiImport({
    appKey,
    appSecret,
    accessToken: oauthToken,
    accessSecret: oauthTokenSecret,
  });

  const { accessToken, accessSecret, screenName, userId } = await tempClient.login(oauthVerifier);

  // Encrypt tokens if configured
  const storedAccessToken = isEncryptionConfigured() ? encryptToken(accessToken) : accessToken;
  const storedAccessSecret = isEncryptionConfigured() ? encryptToken(accessSecret) : accessSecret;

  // Check if account already exists for this persona
  const [existing] = await db
    .select()
    .from(socialAccounts)
    .where(
      and(
        eq(socialAccounts.personaId, personaId),
        eq(socialAccounts.platform, "twitter")
      )
    )
    .limit(1);

  if (existing) {
    // Update existing account
    await db
      .update(socialAccounts)
      .set({
        accessToken: storedAccessToken,
        accessTokenSecret: storedAccessSecret,
        platformUserId: userId,
        platformUsername: screenName,
        externalAccountId: userId,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(socialAccounts.id, existing.id));
  } else {
    // Create new account
    await db.insert(socialAccounts).values({
      personaId,
      platform: "twitter",
      accessToken: storedAccessToken,
      accessTokenSecret: storedAccessSecret,
      platformUserId: userId,
      platformUsername: screenName,
      externalAccountId: userId,
      isActive: true,
    });
  }

  return { screenName, userId };
}

/**
 * Verify that a persona's Twitter credentials are still valid.
 */
export async function verifyCredentials(personaId: string): Promise<{
  valid: boolean;
  screenName?: string;
  error?: string;
}> {
  try {
    const client = await getTwitterClient(personaId);
    const me = await client.v2.me();
    return { valid: true, screenName: me.data.username };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { valid: false, error: message };
  }
}

/**
 * Revoke a persona's Twitter access by removing tokens from DB.
 */
export async function revokeAccess(personaId: string): Promise<boolean> {
  const [account] = await db
    .select({ id: socialAccounts.id })
    .from(socialAccounts)
    .where(
      and(
        eq(socialAccounts.personaId, personaId),
        eq(socialAccounts.platform, "twitter")
      )
    )
    .limit(1);

  if (!account) return false;

  await db
    .update(socialAccounts)
    .set({
      accessToken: null,
      accessTokenSecret: null,
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(socialAccounts.id, account.id));

  return true;
}
