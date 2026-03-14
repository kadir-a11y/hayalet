import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hash } from "bcryptjs";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      title: users.title,
      responsibilities: users.responsibilities,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
    })
    .from(users);

  return NextResponse.json(allUsers);
}

const createUserSchema = z.object({
  name: z.string().min(1, "İsim zorunludur"),
  email: z.string().email("Geçerli e-posta giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  title: z.string().optional(),
  responsibilities: z.string().optional(),
  isAdmin: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const passwordHash = await hash(parsed.data.password, 12);

  try {
    const [user] = await db
      .insert(users)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        title: parsed.data.title,
        responsibilities: parsed.data.responsibilities,
        isAdmin: parsed.data.isAdmin,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        title: users.title,
        responsibilities: users.responsibilities,
        isAdmin: users.isAdmin,
      });

    return NextResponse.json(user, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "23505") {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kullanılıyor" }, { status: 409 });
    }
    throw error;
  }
}
