import type { TwitterApi } from "twitter-api-v2";
import { getTwitterClient } from "./client";

interface PostResult {
  success: boolean;
  externalPostId?: string;
  externalPostUrl?: string;
  error?: string;
}

/**
 * Post a single tweet for a persona.
 */
export async function postTweet(
  personaId: string,
  text: string,
  mediaIds?: string[]
): Promise<PostResult> {
  try {
    const client = await getTwitterClient(personaId);

    const params: Record<string, unknown> = {};
    if (mediaIds && mediaIds.length > 0) {
      params.media = { media_ids: mediaIds };
    }

    const result = await client.v2.tweet(text, params);

    return {
      success: true,
      externalPostId: result.data.id,
      externalPostUrl: `https://x.com/i/status/${result.data.id}`,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * Post a thread (multiple tweets) for content exceeding 280 characters.
 */
export async function postThread(
  personaId: string,
  texts: string[]
): Promise<PostResult> {
  try {
    const client = await getTwitterClient(personaId);

    let lastTweetId: string | undefined;
    let firstTweetId: string | undefined;

    for (const text of texts) {
      const params: Record<string, unknown> = {};
      if (lastTweetId) {
        params.reply = { in_reply_to_tweet_id: lastTweetId };
      }

      const result = await client.v2.tweet(text, params);
      lastTweetId = result.data.id;
      if (!firstTweetId) firstTweetId = result.data.id;
    }

    return {
      success: true,
      externalPostId: firstTweetId,
      externalPostUrl: firstTweetId ? `https://x.com/i/status/${firstTweetId}` : undefined,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * Upload media to Twitter and return media ID.
 */
export async function uploadMedia(
  personaId: string,
  mediaBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const client = await getTwitterClient(personaId);
  const mediaId = await client.v1.uploadMedia(mediaBuffer, { type: mimeType });
  return mediaId;
}

/**
 * Split text into tweet-sized chunks (max 280 chars).
 */
export function splitIntoThread(text: string, maxLength = 280): string[] {
  if (text.length <= maxLength) return [text];

  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (current.length + sentence.length + 1 <= maxLength) {
      current = current ? `${current} ${sentence}` : sentence;
    } else {
      if (current) chunks.push(current);
      current = sentence.length > maxLength ? sentence.slice(0, maxLength) : sentence;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

/**
 * Delete a tweet.
 */
export async function deleteTweet(
  client: TwitterApi,
  tweetId: string
): Promise<boolean> {
  try {
    await client.v2.deleteTweet(tweetId);
    return true;
  } catch {
    return false;
  }
}
