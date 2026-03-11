import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTagsWithCount, createTag } from "@/lib/services/tag-service";
import { tagCreateSchema } from "@/lib/validators/tag";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tags = await getTagsWithCount(session.user.id);
  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = tagCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const tag = await createTag(session.user.id, parsed.data);
  return NextResponse.json(tag, { status: 201 });
}
