import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forumAccounts, personas } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { forumAccountCreateSchema } from "@/lib/validators/forum-account";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = forumAccountCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Verify persona belongs to user (skip for admins)
  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  if (!isAdmin) {
    const [persona] = await db
      .select()
      .from(personas)
      .where(and(eq(personas.id, parsed.data.personaId), eq(personas.userId, session.user.id)))
      .limit(1);

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }
  }

  const [account] = await db
    .insert(forumAccounts)
    .values(parsed.data)
    .returning();

  return NextResponse.json(account, { status: 201 });
}
