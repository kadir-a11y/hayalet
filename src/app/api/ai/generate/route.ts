import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPersonaById } from "@/lib/services/persona-service";
import { generateContent } from "@/lib/ai/gemini";
import { buildContentPrompt } from "@/lib/ai/prompts";
import { z } from "zod";

const generateSchema = z.object({
  personaId: z.string().uuid(),
  platform: z.enum(["twitter", "instagram", "facebook", "linkedin", "tiktok"]),
  contentType: z.enum(["post", "reply", "comment", "story", "reel"]).default("post"),
  topic: z.string().optional(),
  additionalInstructions: z.string().optional(),
  count: z.number().min(1).max(10).default(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const persona = await getPersonaById(parsed.data.personaId, session.user.id);
  if (!persona) {
    return NextResponse.json({ error: "Persona not found" }, { status: 404 });
  }

  const prompt = buildContentPrompt(
    {
      name: persona.name,
      bio: persona.bio || undefined,
      personalityTraits: (persona.personalityTraits as string[]) || [],
      interests: (persona.interests as string[]) || [],
      behavioralPatterns: (persona.behavioralPatterns as any) || {},
      language: persona.language || "tr",
    },
    parsed.data.platform,
    parsed.data.contentType,
    parsed.data.topic,
    parsed.data.additionalInstructions
  );

  try {
    const results: string[] = [];
    for (let i = 0; i < parsed.data.count; i++) {
      const content = await generateContent(prompt);
      results.push(content);
    }

    return NextResponse.json({
      results,
      prompt,
      model: "gemini-2.0-flash-lite",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "AI generation failed", details: error.message },
      { status: 500 }
    );
  }
}
