import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bugReports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
  const { status, adminNote } = body;

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (status) {
    const validStatuses = ["acik", "inceleniyor", "cozuldu", "kapandi", "yeniden_acildi"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Gecersiz durum" }, { status: 400 });
    }
    updateData.status = status;
    if (status === "cozuldu") {
      updateData.resolvedAt = new Date();
    }
    if (status === "yeniden_acildi") {
      updateData.reopenedAt = new Date();
    }
  }

  if (adminNote !== undefined) {
    updateData.adminNote = adminNote;
  }

  if (body.resolvedNote !== undefined) {
    updateData.resolvedNote = body.resolvedNote;
  }

  if (body.reopenNote !== undefined) {
    updateData.reopenNote = body.reopenNote;
  }

  const [updated] = await db
    .update(bugReports)
    .set(updateData)
    .where(eq(bugReports.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
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

  const [deleted] = await db
    .delete(bugReports)
    .where(eq(bugReports.id, id))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
