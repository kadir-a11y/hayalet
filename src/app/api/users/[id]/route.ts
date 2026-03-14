import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  title: z.string().nullable().optional(),
  responsibilities: z.string().nullable().optional(),
  isAdmin: z.boolean().optional(),
});

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
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.email) updateData.email = parsed.data.email;
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.responsibilities !== undefined) updateData.responsibilities = parsed.data.responsibilities;
  if (parsed.data.isAdmin !== undefined) updateData.isAdmin = parsed.data.isAdmin;
  if (parsed.data.password) {
    updateData.passwordHash = await hash(parsed.data.password, 12);
  }

  try {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        title: users.title,
        responsibilities: users.responsibilities,
        isAdmin: users.isAdmin,
      });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "23505") {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kullanılıyor" }, { status: 409 });
    }
    throw error;
  }
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

  // Prevent self-deletion
  if (id === session.user.id) {
    return NextResponse.json({ error: "Kendinizi silemezsiniz" }, { status: 400 });
  }

  const [user] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning();

  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
