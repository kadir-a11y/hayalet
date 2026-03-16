import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaLibrary, personas } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { uploadToR2, generateMediaKey } from "@/lib/r2";
import { getMediaType, getMaxSize } from "@/lib/validators/media";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(session.user.id, "upload");
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const personaId = formData.get("personaId") as string | null;

  if (!file || !personaId) {
    return NextResponse.json(
      { error: "file and personaId are required" },
      { status: 400 }
    );
  }

  // Verify persona belongs to user (skip for admins)
  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  if (!isAdmin) {
    const [persona] = await db
      .select()
      .from(personas)
      .where(and(eq(personas.id, personaId), eq(personas.userId, session.user.id)))
      .limit(1);

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }
  }

  // Validate file type
  const mediaType = getMediaType(file.type);
  if (!mediaType) {
    return NextResponse.json(
      { error: "Desteklenmeyen dosya turu: " + file.type },
      { status: 400 }
    );
  }

  // Validate file size
  const maxSize = getMaxSize(mediaType);
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / 1024 / 1024);
    return NextResponse.json(
      { error: `Dosya boyutu ${maxMB}MB sinirini asiyor.` },
      { status: 400 }
    );
  }

  // Upload to R2
  const r2Key = generateMediaKey(personaId, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const url = await uploadToR2(r2Key, buffer, file.type);

    // Save to database
    const [media] = await db
      .insert(mediaLibrary)
      .values({
        personaId,
        type: mediaType,
        filename: file.name,
        r2Key,
        url,
        contentType: file.type,
        size: file.size,
      })
      .returning();

    return NextResponse.json(media, { status: 201 });
  } catch (err) {
    console.error("R2 upload error:", err);
    return NextResponse.json(
      { error: "Dosya yuklenemedi." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const personaId = searchParams.get("personaId");

  if (!personaId) {
    return NextResponse.json({ error: "personaId is required" }, { status: 400 });
  }

  // Verify persona belongs to user (skip for admins)
  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  if (!isAdmin) {
    const [persona] = await db
      .select()
      .from(personas)
      .where(and(eq(personas.id, personaId), eq(personas.userId, session.user.id)))
      .limit(1);

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }
  }

  const media = await db
    .select()
    .from(mediaLibrary)
    .where(eq(mediaLibrary.personaId, personaId))
    .orderBy(desc(mediaLibrary.createdAt));

  return NextResponse.json(media);
}
