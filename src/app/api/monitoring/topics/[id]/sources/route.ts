import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { monitoredTopics, monitoringSources } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sourceCreateSchema } from "@/lib/validators/monitoring";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify topic ownership
  const [topic] = await db
    .select()
    .from(monitoredTopics)
    .where(and(eq(monitoredTopics.id, id), eq(monitoredTopics.userId, session.user.id)))
    .limit(1);

  if (!topic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sources = await db
    .select()
    .from(monitoringSources)
    .where(eq(monitoringSources.topicId, id));

  return NextResponse.json(sources);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify topic ownership
  const [topic] = await db
    .select()
    .from(monitoredTopics)
    .where(and(eq(monitoredTopics.id, id), eq(monitoredTopics.userId, session.user.id)))
    .limit(1);

  if (!topic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = sourceCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [source] = await db
    .insert(monitoringSources)
    .values({
      topicId: id,
      sourceType: parsed.data.sourceType,
      config: parsed.data.config,
      isActive: parsed.data.isActive,
    })
    .returning();

  return NextResponse.json(source, { status: 201 });
}
