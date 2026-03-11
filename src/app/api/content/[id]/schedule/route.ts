import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getContentItemById, updateContentItem } from "@/lib/services/content-service";
import { contentDeliveryQueue } from "@/lib/queue/queues";
import { logActivity } from "@/lib/services/activity-log-service";
import { z } from "zod";

const scheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const item = await getContentItemById(id, session.user.id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = scheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const scheduledAt = new Date(parsed.data.scheduledAt);
  const delay = Math.max(0, scheduledAt.getTime() - Date.now());

  // Add jitter (0-5 minutes)
  const jitter = Math.floor(Math.random() * 5 * 60 * 1000);

  await updateContentItem(id, {
    status: "scheduled",
    scheduledAt: parsed.data.scheduledAt,
  });

  await contentDeliveryQueue.add(
    `deliver-${id}`,
    {
      contentItemId: id,
      platform: item.contentItem.platform,
      content: item.contentItem.content,
      personaId: item.contentItem.personaId,
    },
    { delay: delay + jitter }
  );

  await logActivity(session.user.id, "content", id, "scheduled");
  return NextResponse.json({ success: true, scheduledAt: parsed.data.scheduledAt });
}
