import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateConfig, deleteConfig } from "@/lib/services/organic-activity-service";
import { organicConfigUpdateSchema } from "@/lib/validators/organic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; cid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cid } = await params;
  const body = await req.json();
  const parsed = organicConfigUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const config = await updateConfig(cid, parsed.data);
  if (!config) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(config);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; cid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cid } = await params;
  const config = await deleteConfig(cid);
  if (!config) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
