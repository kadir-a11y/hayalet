import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { roles, roleCategories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { roleCreateSchema } from "@/lib/validators/role";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allRoles = await db
    .select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      color: roles.color,
      categoryId: roles.categoryId,
      categoryName: roleCategories.name,
      categoryColor: roleCategories.color,
      createdAt: roles.createdAt,
    })
    .from(roles)
    .leftJoin(roleCategories, eq(roles.categoryId, roleCategories.id))
    .where(eq(roles.userId, session.user.id))
    .orderBy(desc(roles.createdAt));

  return NextResponse.json(allRoles);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = roleCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [role] = await db
    .insert(roles)
    .values({ ...parsed.data, userId: session.user.id })
    .returning();

  return NextResponse.json(role, { status: 201 });
}
