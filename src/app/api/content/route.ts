import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getContentItems, createContentItem, createBulkContentItems } from "@/lib/services/content-service";
import { contentItemCreateSchema, bulkContentCreateSchema } from "@/lib/validators/content";
import { logActivity } from "@/lib/services/activity-log-service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const items = await getContentItems(session.user.id, {
    status: searchParams.get("status") || undefined,
    personaId: searchParams.get("personaId") || undefined,
    platform: searchParams.get("platform") || undefined,
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Check if bulk create
  if (body.personaIds) {
    const parsed = bulkContentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { personaIds, ...data } = parsed.data;
    const items = await createBulkContentItems(personaIds, data);

    for (const item of items) {
      await logActivity(session.user.id, "content", item.id, "created");
    }

    return NextResponse.json(items, { status: 201 });
  }

  const parsed = contentItemCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await createContentItem(parsed.data);
  await logActivity(session.user.id, "content", item.id, "created");

  return NextResponse.json(item, { status: 201 });
}
