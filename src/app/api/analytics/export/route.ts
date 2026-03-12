import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getContentItems } from "@/lib/services/content-service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getContentItems(session.user.id);

  const csvHeader = "ID,Persona,Platform,Content Type,Status,Content,Scheduled At,Published At,AI Generated,Created At\n";
  const csvRows = items
    .map((item) => {
      const ci = item.contentItem;
      return [
        ci.id,
        `"${item.personaName}"`,
        ci.platform,
        ci.contentType,
        ci.status,
        `"${ci.content.replace(/"/g, '""').substring(0, 200)}"`,
        ci.scheduledAt || "",
        ci.publishedAt || "",
        ci.aiGenerated,
        ci.createdAt,
      ].join(",");
    })
    .join("\n");

  const csv = csvHeader + csvRows;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=persona-export-${new Date().toISOString().split("T")[0]}.csv`,
    },
  });
}
