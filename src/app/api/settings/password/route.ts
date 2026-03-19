import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { compare, hash } from "bcryptjs";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { passwordUpdateSchema } from "@/lib/validators/settings";
import { apiError, apiValidationError } from "@/lib/api/response";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(session.user.id, "password");
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const body = await req.json();
  const parsed = passwordUpdateSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const { currentPassword, newPassword } = parsed.data;

  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "Kullanici bulunamadi" }, { status: 404 });
  }

  const isValid = await compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return NextResponse.json(
      { error: "Mevcut şifre yanlış" },
      { status: 400 }
    );
  }

  const newHash = await hash(newPassword, 12);

  await db
    .update(users)
    .set({
      passwordHash: newHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ success: true });
}
