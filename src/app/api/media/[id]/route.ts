import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaLibrary } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { deleteFromR2 } from "@/lib/r2";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Get media item
  const [media] = await db
    .select()
    .from(mediaLibrary)
    .where(eq(mediaLibrary.id, id))
    .limit(1);

  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete from R2
  try {
    await deleteFromR2(media.r2Key);
  } catch (err) {
    console.error("R2 delete error:", err);
  }

  // Delete from database
  await db.delete(mediaLibrary).where(eq(mediaLibrary.id, id));

  return NextResponse.json({ success: true });
}
