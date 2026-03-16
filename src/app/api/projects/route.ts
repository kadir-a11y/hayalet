import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProjects, createProject, applyPlaybook } from "@/lib/services/project-service";
import { projectCreateSchema } from "@/lib/validators/project";
import { logActivity } from "@/lib/services/activity-log-service";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filters = {
    type: searchParams.get("type") || undefined,
    status: searchParams.get("status") || undefined,
    severity: searchParams.get("severity") || undefined,
    search: searchParams.get("search") || undefined,
  };

  const [dbUser] = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, session.user.id)).limit(1);
  const isAdmin = Boolean(dbUser?.isAdmin);
  const projects = await getProjects(session.user.id, filters, isAdmin);
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = projectCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const project = await createProject(session.user.id, parsed.data);

  // Playbook seçildiyse uygula
  if (parsed.data.playbookId) {
    await applyPlaybook(project.id, parsed.data.playbookId);
  }

  await logActivity(session.user.id, "project", project.id, "created", { name: project.name });
  return NextResponse.json(project, { status: 201 });
}
