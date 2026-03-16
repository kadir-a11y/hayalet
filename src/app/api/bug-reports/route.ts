import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bugReports } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { bugReportCreateSchema } from "@/lib/validators/settings";
import { apiError, apiValidationError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let query = db.select().from(bugReports).orderBy(desc(bugReports.createdAt));

  if (status && status !== "all") {
    const results = await db
      .select()
      .from(bugReports)
      .where(eq(bugReports.status, status))
      .orderBy(desc(bugReports.createdAt));
    return NextResponse.json(results);
  }

  const results = await query;
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = bugReportCreateSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const { page, description, priority } = parsed.data;

  const [report] = await db
    .insert(bugReports)
    .values({
      userId: session.user.id,
      userName: session.user.name || null,
      page,
      description,
      priority,
    })
    .returning();

  return NextResponse.json(report, { status: 201 });
}
