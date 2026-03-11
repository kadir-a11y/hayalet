import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setPersonaTags } from "@/lib/services/persona-service";
import { z } from "zod";

const setTagsSchema = z.object({
  tagIds: z.array(z.string().uuid()),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = setTagsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await setPersonaTags(id, parsed.data.tagIds);
  return NextResponse.json({ success: true });
}
