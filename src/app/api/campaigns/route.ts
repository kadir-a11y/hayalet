import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCampaigns, createCampaign } from "@/lib/services/campaign-service";
import { campaignCreateSchema } from "@/lib/validators/campaign";
import { logActivity } from "@/lib/services/activity-log-service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  const campaigns = await getCampaigns(session.user.id, isAdmin);
  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = campaignCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const campaign = await createCampaign(session.user.id, parsed.data);
  await logActivity(session.user.id, "campaign", campaign.id, "created", { name: campaign.name });

  return NextResponse.json(campaign, { status: 201 });
}
