import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects, projectMentions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface TweetData {
  url: string;
  author: string;
  text: string;
  createdAt: string;
  views: number;
  engagement: number;
}

const MAX_PAGES = 10; // Max 10 sayfa = ~500 tweet

function parseTweets(data: Record<string, unknown>): { tweets: TweetData[]; cursor: string | null } {
  const entries =
    (data as Record<string, unknown> as { result?: { timeline_response?: { timeline?: { instructions?: Array<{ entries?: unknown[] }> } } } })
      ?.result?.timeline_response?.timeline?.instructions?.[0]?.entries || [];

  const tweets: TweetData[] = [];

  for (const entry of entries) {
    const tweet = entry?.content?.content?.tweet_results?.result;
    if (!tweet?.rest_id) continue;

    const user = tweet.core?.user_results?.result;
    const details = tweet.details;
    const counts = tweet.counts;
    const fullText = details?.full_text;
    if (!fullText) continue;

    const username = user?.core?.screen_name || "unknown";

    tweets.push({
      url: `https://x.com/${username}/status/${tweet.rest_id}`,
      author: `@${username}`,
      text: fullText,
      createdAt: details?.created_at_ms
        ? new Date(details.created_at_ms).toISOString()
        : new Date().toISOString(),
      views: parseInt(tweet.views?.count || "0", 10) || 0,
      engagement:
        (counts?.favorite_count || 0) +
        (counts?.retweet_count || 0) +
        (counts?.reply_count || 0),
    });
  }

  const cursor = (data as Record<string, unknown> as { cursor?: { bottom?: string } })?.cursor?.bottom || null;

  return { tweets, cursor };
}

async function runTwitterScan(projectId: string, keywords: string[]) {
  if (keywords.length === 0) return { added: 0, skipped: 0 };

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error("RAPIDAPI_KEY not configured");

  const query = keywords.join(" ");
  const allTweets: TweetData[] = [];
  let cursor: string | null = null;
  const seenIds = new Set<string>();

  for (let page = 0; page < MAX_PAGES; page++) {
    let url = `https://twitter241.p.rapidapi.com/search-v3?type=Latest&count=50&query=${encodeURIComponent(query)}`;
    if (cursor) {
      url += `&cursor=${encodeURIComponent(cursor)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "twitter241.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Twitter API error on page ${page + 1}: ${response.status}`);
      break;
    }

    const data = await response.json();
    const result = parseTweets(data);

    // Deduplicate within this scan
    let newCount = 0;
    for (const tweet of result.tweets) {
      if (!seenIds.has(tweet.url)) {
        seenIds.add(tweet.url);
        allTweets.push(tweet);
        newCount++;
      }
    }

    console.log(`[TwitterScan] Page ${page + 1}: ${newCount} tweets`);

    // No more pages
    if (!result.cursor || result.tweets.length === 0) break;
    cursor = result.cursor;
  }

  if (allTweets.length === 0) return { added: 0, skipped: 0 };

  // Duplikat kontrolü
  const existing = await db
    .select({ sourceUrl: projectMentions.sourceUrl })
    .from(projectMentions)
    .where(eq(projectMentions.projectId, projectId));

  const existingUrls = new Set(existing.map((m) => m.sourceUrl).filter(Boolean));
  const newTweets = allTweets.filter((t) => !existingUrls.has(t.url));

  if (newTweets.length > 0) {
    await db.insert(projectMentions).values(
      newTweets.map((tweet) => ({
        projectId,
        platform: "twitter",
        sourceUrl: tweet.url,
        sourceAuthor: tweet.author,
        content: tweet.text,
        sentiment: "neutral",
        reachEstimate: tweet.views,
        engagementCount: tweet.engagement,
        requiresResponse: false,
        responseStatus: "not_needed" as const,
        detectedAt: new Date(tweet.createdAt),
      }))
    );
  }

  // Son tarama zamanını güncelle
  await db
    .update(projects)
    .set({ lastTwitterScanAt: new Date(), updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  return { added: newTweets.length, skipped: allTweets.length - newTweets.length };
}

// GET — auto-scan durumunu getir
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [project] = await db
    .select({
      twitterAutoScan: projects.twitterAutoScan,
      lastTwitterScanAt: projects.lastTwitterScanAt,
    })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    enabled: project.twitterAutoScan ?? false,
    lastScanAt: project.lastTwitterScanAt,
  });
}

// POST — auto-scan aç/kapat + hemen tarama yap
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { enabled, scanNow } = body as { enabled?: boolean; scanNow?: boolean };

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Toggle auto-scan
  if (typeof enabled === "boolean") {
    await db
      .update(projects)
      .set({ twitterAutoScan: enabled, updatedAt: new Date() })
      .where(eq(projects.id, id));

    // Açılınca hemen ilk taramayı yap
    if (enabled) {
      const keywords = (project.keywords as string[]) || [];
      try {
        await runTwitterScan(id, keywords);
      } catch (error) {
        console.error("Initial scan error:", error);
      }
    }
  }

  // Manuel tarama
  if (scanNow) {
    const keywords = (project.keywords as string[]) || [];
    try {
      const result = await runTwitterScan(id, keywords);
      const [updated] = await db
        .select({
          twitterAutoScan: projects.twitterAutoScan,
          lastTwitterScanAt: projects.lastTwitterScanAt,
        })
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);

      return NextResponse.json({
        enabled: updated.twitterAutoScan ?? false,
        lastScanAt: updated.lastTwitterScanAt,
        ...result,
      });
    } catch (error) {
      console.error("Scan error:", error);
      return NextResponse.json(
        { error: "Tarama sırasında hata oluştu" },
        { status: 500 }
      );
    }
  }

  const [updated] = await db
    .select({
      twitterAutoScan: projects.twitterAutoScan,
      lastTwitterScanAt: projects.lastTwitterScanAt,
    })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  return NextResponse.json({
    enabled: updated.twitterAutoScan ?? false,
    lastScanAt: updated.lastTwitterScanAt,
  });
}
