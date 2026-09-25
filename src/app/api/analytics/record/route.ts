import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/newsletters/server";

export const runtime = "nodejs";

const allowed = new Set(["article_view", "ad_impression", "ad_click", "newsletter_signup", "support_click", "marketplace_lead", "event_interest", "search_submit"]);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function text(value: unknown, maximum: number) {
  return String(value || "").trim().slice(0, maximum) || null;
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) return NextResponse.json({ error: "Invalid analytics origin." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const eventType = text(body?.eventType, 64);
  if (!eventType || !allowed.has(eventType)) return NextResponse.json({ error: "Unsupported analytics event." }, { status: 400 });

  const pagePath = text(body?.pagePath, 300);
  if (!pagePath || !pagePath.startsWith("/")) return NextResponse.json({ error: "Invalid page path." }, { status: 400 });

  try {
    const { error } = await serviceClient().from("hgn_public_analytics_events").insert({
      event_type: eventType,
      page_path: pagePath,
      article_id: uuid.test(String(body?.articleId || "")) ? body.articleId : null,
      article_slug: text(body?.articleSlug, 180),
      ad_id: uuid.test(String(body?.adId || "")) ? body.adId : null,
      placement_key: text(body?.placement, 120),
      source: text(body?.source, 80),
    });
    if (error) return NextResponse.json({ error: "Analytics event could not be recorded." }, { status: 503 });
  } catch {
    return NextResponse.json({ error: "Analytics is temporarily unavailable." }, { status: 503 });
  }

  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
