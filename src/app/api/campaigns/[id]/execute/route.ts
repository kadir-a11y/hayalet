import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCampaignById } from "@/lib/services/campaign-service";
import { campaignQueue } from "@/lib/queue/queues";
import { logActivity } from "@/lib/services/activity-log-service";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const campaign = await getCampaignById(id, session.user.id);
  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await campaignQueue.add(`execute-${id}`, {
    campaignId: id,
    userId: session.user.id,
  });

  await logActivity(session.user.id, "campaign", id, "executed");
  return NextResponse.json({ success: true, message: "Campaign execution queued" });
}
