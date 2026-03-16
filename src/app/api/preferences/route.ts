import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { preferenceSetSchema } from "@/lib/validators/settings";
import { apiError, apiValidationError } from "@/lib/api/response";

// GET /api/preferences?page=personas
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");

  const conditions = [eq(userPreferences.userId, session.user.id)];
  if (page) {
    conditions.push(eq(userPreferences.page, page));
  }

  const prefs = await db
    .select()
    .from(userPreferences)
    .where(and(...conditions));

  const result: Record<string, Record<string, unknown>> = {};
  for (const pref of prefs) {
    if (!result[pref.page]) result[pref.page] = {};
    result[pref.page][pref.key] = pref.value;
  }

  return NextResponse.json(result);
}

// POST /api/preferences
// Body: { page: "personas", key: "filters", value: {...} }
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = preferenceSetSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const { page, key, value } = parsed.data;

  const existing = await db
    .select()
    .from(userPreferences)
    .where(
      and(
        eq(userPreferences.userId, session.user.id),
        eq(userPreferences.page, page),
        eq(userPreferences.key, key)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(userPreferences)
      .set({ value, updatedAt: new Date() })
      .where(eq(userPreferences.id, existing[0].id));
  } else {
    await db.insert(userPreferences).values({
      userId: session.user.id,
      page,
      key,
      value,
    });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/preferences?page=personas&key=savedFilter_myFilter
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");
  const key = searchParams.get("key");

  if (!page || !key) {
    return NextResponse.json(
      { error: "page ve key zorunludur" },
      { status: 400 }
    );
  }

  await db
    .delete(userPreferences)
    .where(
      and(
        eq(userPreferences.userId, session.user.id),
        eq(userPreferences.page, page),
        eq(userPreferences.key, key)
      )
    );

  return NextResponse.json({ success: true });
}
