import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { metricsCollectionQueue } from "@/lib/queue/queues";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  await metricsCollectionQueue.add("manual-collect", { platform: "twitter" });

  return NextResponse.json({ success: true, message: "Metrics collection job queued" });
}
