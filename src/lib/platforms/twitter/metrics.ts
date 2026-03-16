import { getTwitterClient } from "./client";

interface TweetMetrics {
  likes: number;
  retweets: number;
  replies: number;
  impressions: number;
  quotes: number;
}

/**
 * Fetch public metrics for a single tweet.
 */
export async function getTweetMetrics(
  personaId: string,
  tweetId: string
): Promise<TweetMetrics> {
  const client = await getTwitterClient(personaId);

  const tweet = await client.v2.singleTweet(tweetId, {
    "tweet.fields": ["public_metrics"],
  });

  const metrics = tweet.data.public_metrics;

  return {
    likes: metrics?.like_count ?? 0,
    retweets: metrics?.retweet_count ?? 0,
    replies: metrics?.reply_count ?? 0,
    impressions: metrics?.impression_count ?? 0,
    quotes: metrics?.quote_count ?? 0,
  };
}

/**
 * Fetch metrics for multiple tweets in a single API call (up to 100).
 */
export async function getBatchTweetMetrics(
  personaId: string,
  tweetIds: string[]
): Promise<Map<string, TweetMetrics>> {
  const results = new Map<string, TweetMetrics>();
  if (tweetIds.length === 0) return results;

  const client = await getTwitterClient(personaId);

  // Twitter API v2 allows up to 100 IDs per lookup
  const batchSize = 100;
  for (let i = 0; i < tweetIds.length; i += batchSize) {
    const batch = tweetIds.slice(i, i + batchSize);

    const response = await client.v2.tweets(batch, {
      "tweet.fields": ["public_metrics"],
    });

    if (response.data) {
      for (const tweet of response.data) {
        const m = tweet.public_metrics;
        results.set(tweet.id, {
          likes: m?.like_count ?? 0,
          retweets: m?.retweet_count ?? 0,
          replies: m?.reply_count ?? 0,
          impressions: m?.impression_count ?? 0,
          quotes: m?.quote_count ?? 0,
        });
      }
    }
  }

  return results;
}
