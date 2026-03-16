import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { removeTeamMember, updateTeamRole } from "@/lib/services/project-team-service";
import { canWriteProject } from "@/lib/services/project-service";
import { teamRoles } from "@/lib/validators/project";
import { z } from "zod";

const updateSchema = z.object({
  teamRole: z.enum(teamRoles),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, teamId } = await params;
  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  if (!await canWriteProject(id, session.user.id, isAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateTeamRole(teamId, parsed.data.teamRole);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, teamId } = await params;
  const isAdmin = (session.user as unknown as Record<string, unknown>).isAdmin === true;
  if (!await canWriteProject(id, session.user.id, isAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const removed = await removeTeamMember(teamId);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
