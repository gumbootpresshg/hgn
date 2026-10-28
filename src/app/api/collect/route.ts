import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/newsletters/server";

export const runtime = "nodejs";

// Compatibility endpoint for a briefly cached earlier tracker. It records a
// local anonymous page view rather than attempting a third-party relay.
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid analytics origin." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const pagePath = String(body?.path || "").trim().slice(0, 300);
  if (!pagePath.startsWith("/")) return NextResponse.json({ error: "Invalid page path." }, { status: 400 });
  const { error } = await serviceClient().from("hgn_public_analytics_events").insert({ event_type: "page_view", page_path: pagePath, source: "site" });
  if (error) return NextResponse.json({ error: "Analytics event could not be recorded." }, { status: 503 });
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
