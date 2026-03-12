import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { roles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { roleUpdateSchema } from "@/lib/validators/role";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = roleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  const [role] = await db
    .update(roles)
    .set(parsed.data)
    .where(isAdmin ? eq(roles.id, id) : and(eq(roles.id, id), eq(roles.userId, session.user.id)))
    .returning();

  if (!role) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(role);
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
  const [role] = await db
    .delete(roles)
    .where(isAdmin ? eq(roles.id, id) : and(eq(roles.id, id), eq(roles.userId, session.user.id)))
    .returning();

  if (!role) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
