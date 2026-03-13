import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateResponse } from "@/lib/services/workspace-service";
import { workspaceResponseUpdateSchema } from "@/lib/validators/workspace";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; rid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rid } = await params;
  const body = await req.json();
  const parsed = workspaceResponseUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const response = await updateResponse(rid, parsed.data.editedContent);
  if (!response) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(response);
}
