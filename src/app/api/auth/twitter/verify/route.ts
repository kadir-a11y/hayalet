import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyCredentials } from "@/lib/platforms/twitter/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const personaId = req.nextUrl.searchParams.get("personaId");
  if (!personaId) {
    return NextResponse.json({ error: "personaId is required" }, { status: 400 });
  }

  try {
    const result = await verifyCredentials(personaId);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
