import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateTag, deleteTag } from "@/lib/services/tag-service";
import { tagUpdateSchema } from "@/lib/validators/tag";

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
  const parsed = tagUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  const tag = await updateTag(id, session.user.id, parsed.data, isAdmin);
  if (!tag) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(tag);
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
  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  const tag = await deleteTag(id, session.user.id, isAdmin);
  if (!tag) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
