import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { revokeAccess } from "@/lib/platforms/twitter/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { personaId } = await req.json();
  if (!personaId) {
    return NextResponse.json({ error: "personaId is required" }, { status: 400 });
  }

  try {
    const revoked = await revokeAccess(personaId);
    if (!revoked) {
      return NextResponse.json({ error: "No Twitter account found for this persona" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
