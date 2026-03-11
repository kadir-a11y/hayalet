import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { personaRoles, personas, roles, roleCategories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify persona belongs to user
  const [persona] = await db
    .select()
    .from(personas)
    .where(and(eq(personas.id, id), eq(personas.userId, session.user.id)))
    .limit(1);

  if (!persona) {
    return NextResponse.json({ error: "Persona not found" }, { status: 404 });
  }

  const assigned = await db
    .select({
      roleId: personaRoles.roleId,
      roleName: roles.name,
      roleColor: roles.color,
      roleDescription: roles.description,
      categoryId: roles.categoryId,
      categoryName: roleCategories.name,
      categoryColor: roleCategories.color,
    })
    .from(personaRoles)
    .innerJoin(roles, eq(personaRoles.roleId, roles.id))
    .leftJoin(roleCategories, eq(roles.categoryId, roleCategories.id))
    .where(eq(personaRoles.personaId, id));

  return NextResponse.json(assigned);
}

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
  const roleIds: string[] = body.roleIds;

  if (!Array.isArray(roleIds)) {
    return NextResponse.json({ error: "roleIds array is required" }, { status: 400 });
  }

  // Verify persona belongs to user
  const [persona] = await db
    .select()
    .from(personas)
    .where(and(eq(personas.id, id), eq(personas.userId, session.user.id)))
    .limit(1);

  if (!persona) {
    return NextResponse.json({ error: "Persona not found" }, { status: 404 });
  }

  // Replace all role assignments
  await db.delete(personaRoles).where(eq(personaRoles.personaId, id));

  if (roleIds.length > 0) {
    await db.insert(personaRoles).values(
      roleIds.map((roleId) => ({
        personaId: id,
        roleId,
      }))
    );
  }

  return NextResponse.json({ success: true });
}
