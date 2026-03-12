import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { monitoredTopics } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { monitoringQueue } from "@/lib/queue/queues";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [topic] = await db
    .select()
    .from(monitoredTopics)
    .where(and(eq(monitoredTopics.id, id), eq(monitoredTopics.userId, session.user.id)))
    .limit(1);

  if (!topic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await monitoringQueue.add(`manual-check-${id}`, { topicId: id });

  return NextResponse.json({ success: true, message: "Check queued" });
}
