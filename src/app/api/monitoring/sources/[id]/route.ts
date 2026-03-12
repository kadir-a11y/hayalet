import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { monitoringSources, monitoredTopics } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sourceUpdateSchema } from "@/lib/validators/monitoring";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = sourceUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Get source and verify topic ownership (skip for admins)
  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  const [source] = await db
    .select()
    .from(monitoringSources)
    .where(eq(monitoringSources.id, id))
    .limit(1);

  if (!source) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isAdmin) {
    const [topic] = await db
      .select()
      .from(monitoredTopics)
      .where(and(eq(monitoredTopics.id, source.topicId), eq(monitoredTopics.userId, session.user.id)))
      .limit(1);

    if (!topic) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const [updated] = await db
    .update(monitoringSources)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(monitoringSources.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  const [source] = await db
    .select()
    .from(monitoringSources)
    .where(eq(monitoringSources.id, id))
    .limit(1);

  if (!source) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isAdmin) {
    const [topic] = await db
      .select()
      .from(monitoredTopics)
      .where(and(eq(monitoredTopics.id, source.topicId), eq(monitoredTopics.userId, session.user.id)))
      .limit(1);

    if (!topic) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  await db.delete(monitoringSources).where(eq(monitoringSources.id, id));

  return NextResponse.json({ success: true });
}
