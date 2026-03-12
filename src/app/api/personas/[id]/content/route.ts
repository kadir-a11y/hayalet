import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentItems, personas } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify persona belongs to user (skip for admins)
  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  if (!isAdmin) {
    const [persona] = await db
      .select({ id: personas.id })
      .from(personas)
      .where(and(eq(personas.id, id), eq(personas.userId, session.user.id)))
      .limit(1);

    if (!persona) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const items = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.personaId, id))
    .orderBy(desc(contentItems.createdAt));

  return NextResponse.json(items);
}
