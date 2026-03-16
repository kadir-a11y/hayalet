interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const TWITTER_LIMITS = {
  maxTweetLength: 280,
  maxMediaPerTweet: 4,
  maxThreadSize: 25,
  urlLength: 23, // Twitter wraps all URLs to 23 chars via t.co
};

/**
 * Validate content for Twitter posting.
 * Returns errors (blocking) and warnings (informational).
 */
export function validateTwitterContent(
  text: string,
  mediaCount = 0
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!text.trim()) {
    errors.push("Tweet content cannot be empty");
    return { valid: false, errors, warnings };
  }

  // Calculate effective length (URLs count as 23 chars)
  const effectiveLength = calculateTweetLength(text);

  if (effectiveLength > TWITTER_LIMITS.maxTweetLength) {
    errors.push(
      `Tweet exceeds ${TWITTER_LIMITS.maxTweetLength} character limit ` +
      `(effective length: ${effectiveLength}). Consider splitting into a thread.`
    );
  }

  if (mediaCount > TWITTER_LIMITS.maxMediaPerTweet) {
    errors.push(
      `Maximum ${TWITTER_LIMITS.maxMediaPerTweet} media items per tweet ` +
      `(got ${mediaCount})`
    );
  }

  // Warnings
  if (effectiveLength > 250 && effectiveLength <= TWITTER_LIMITS.maxTweetLength) {
    warnings.push("Tweet is close to the character limit");
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate a thread of tweets.
 */
export function validateTwitterThread(tweets: string[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (tweets.length === 0) {
    errors.push("Thread must have at least one tweet");
    return { valid: false, errors, warnings };
  }

  if (tweets.length > TWITTER_LIMITS.maxThreadSize) {
    errors.push(
      `Thread exceeds ${TWITTER_LIMITS.maxThreadSize} tweet limit (got ${tweets.length})`
    );
  }

  for (let i = 0; i < tweets.length; i++) {
    const length = calculateTweetLength(tweets[i]);
    if (length > TWITTER_LIMITS.maxTweetLength) {
      errors.push(
        `Tweet ${i + 1} exceeds ${TWITTER_LIMITS.maxTweetLength} chars (got ${length})`
      );
    }
    if (!tweets[i].trim()) {
      errors.push(`Tweet ${i + 1} is empty`);
    }
  }

  if (tweets.length > 10) {
    warnings.push("Long threads may have lower engagement");
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Calculate the effective length of a tweet, accounting for
 * Twitter's URL shortening (all URLs become 23 chars).
 */
function calculateTweetLength(text: string): number {
  // Replace URLs with 23-char placeholders
  const urlPattern = /https?:\/\/[^\s]+/g;
  const withoutUrls = text.replace(urlPattern, "x".repeat(TWITTER_LIMITS.urlLength));
  return withoutUrls.length;
}

export { TWITTER_LIMITS };
