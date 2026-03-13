import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConfigs, createConfig } from "@/lib/services/organic-activity-service";
import { organicConfigCreateSchema } from "@/lib/validators/organic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const configs = await getConfigs(id);
  return NextResponse.json(configs);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = organicConfigCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const config = await createConfig(id, parsed.data);
  return NextResponse.json(config, { status: 201 });
}
