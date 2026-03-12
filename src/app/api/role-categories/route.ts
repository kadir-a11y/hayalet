import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { roleCategories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { roleCategoryCreateSchema } from "@/lib/validators/role";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  const categories = await db
    .select()
    .from(roleCategories)
    .where(isAdmin ? undefined : eq(roleCategories.userId, session.user.id))
    .orderBy(desc(roleCategories.createdAt));

  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = roleCategoryCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [category] = await db
    .insert(roleCategories)
    .values({ ...parsed.data, userId: session.user.id })
    .returning();

  return NextResponse.json(category, { status: 201 });
}
