import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { personas } from "@/lib/db/schema";
import { personaCreateSchema } from "@/lib/validators/persona";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!Array.isArray(body.personas) || body.personas.length === 0) {
    return NextResponse.json(
      { error: "personas array is required" },
      { status: 400 }
    );
  }

  const BATCH_SIZE = 50;
  let successCount = 0;
  let errorCount = 0;
  const errors: { index: number; name: string; error: string }[] = [];

  for (let i = 0; i < body.personas.length; i += BATCH_SIZE) {
    const batch = body.personas.slice(i, i + BATCH_SIZE);
    const validBatch: typeof personas.$inferInsert[] = [];

    for (let j = 0; j < batch.length; j++) {
      const parsed = personaCreateSchema.safeParse(batch[j]);
      if (!parsed.success) {
        errorCount++;
        errors.push({
          index: i + j,
          name: batch[j].name || "unknown",
          error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", "),
        });
        continue;
      }

      validBatch.push({
        userId: session.user.id,
        name: parsed.data.name,
        displayName: parsed.data.displayName ?? null,
        bio: parsed.data.bio ?? null,
        gender: parsed.data.gender ?? null,
        birthDate: parsed.data.birthDate ?? null,
        country: parsed.data.country ?? null,
        city: parsed.data.city ?? null,
        language: parsed.data.language,
        timezone: parsed.data.timezone,
        personalityTraits: parsed.data.personalityTraits,
        interests: parsed.data.interests,
        behavioralPatterns: parsed.data.behavioralPatterns,
        activeHoursStart: parsed.data.activeHoursStart,
        activeHoursEnd: parsed.data.activeHoursEnd,
        maxPostsPerDay: parsed.data.maxPostsPerDay,
        isActive: parsed.data.isActive,
        isVerified: parsed.data.isVerified,
      });
    }

    if (validBatch.length > 0) {
      await db.insert(personas).values(validBatch);
      successCount += validBatch.length;
    }
  }

  return NextResponse.json(
    {
      successCount,
      errorCount,
      totalCount: body.personas.length,
      errors: errors.slice(0, 20),
    },
    { status: 201 }
  );
}
