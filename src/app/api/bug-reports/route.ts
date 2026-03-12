import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bugReports } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

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
  const { page, description, priority } = body;

  if (!page || !description) {
    return NextResponse.json(
      { error: "Sayfa ve aciklama zorunludur" },
      { status: 400 }
    );
  }

  const validPriorities = ["dusuk", "normal", "yuksek", "kritik"];
  const finalPriority = validPriorities.includes(priority) ? priority : "normal";

  const [report] = await db
    .insert(bugReports)
    .values({
      userId: session.user.id,
      userName: session.user.name || null,
      page,
      description,
      priority: finalPriority,
    })
    .returning();

  return NextResponse.json(report, { status: 201 });
}
