import { NextResponse } from "next/server";
import { notifyHgnOperations } from "@/lib/hgn-operations-notify";

const allowedTypes = new Set([
  "story_tip", "photo", "obituary", "event", "classified", "job",
  "notice", "letter", "correction", "visitor_listing", "live_map", "prospect"
]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const submissionType = String(body?.submissionType || "").trim();
  const sourceId = String(body?.sourceId || "").trim();

  if (!allowedTypes.has(submissionType) || !sourceId) {
    return NextResponse.json({ error: "Invalid submission notification." }, { status: 400 });
  }

  const result = await notifyHgnOperations({
    submissionType,
    sourceId,
    title: body?.title ? String(body.title).slice(0, 300) : null,
    submitterName: body?.submitterName ? String(body.submitterName).slice(0, 200) : null,
    submitterEmail: body?.submitterEmail ? String(body.submitterEmail).slice(0, 320) : null,
    publicAdminUrl: body?.publicAdminUrl ? String(body.publicAdminUrl).slice(0, 500) : null,
    metadata: body?.metadata && typeof body.metadata === "object" ? body.metadata : {},
  });

  return NextResponse.json({ ok: true, delivered: result.delivered });
}
