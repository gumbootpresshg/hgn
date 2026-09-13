import { NextRequest, NextResponse } from "next/server";
import { requirePublisher } from "@/lib/newsletters/server";
import { absoluteUrl, SITE } from "@/lib/site";

export const runtime = "nodejs";

function normalizeUrl(value: unknown) {
  const text = String(value || "").trim();
  if (!text) return "";
  try {
    const url = new URL(text.startsWith("http") ? text : absoluteUrl(text));
    const site = new URL(SITE.url);
    if (url.host !== site.host) return "";
    return url.toString();
  } catch { return ""; }
}

export async function POST(req: NextRequest) {
  const auth = await requirePublisher(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const key = String(process.env.INDEXNOW_KEY || "").trim();
  if (!key) return NextResponse.json({ configured: false, submitted: false, message: "INDEXNOW_KEY is not configured." });
  const body = await req.json().catch(() => ({}));
  const requested = Array.isArray(body?.urls) ? body.urls : [body?.url];
  const urls = Array.from(new Set(requested.map(normalizeUrl).filter(Boolean))).slice(0, 10000);
  if (!urls.length) return NextResponse.json({ error: "No valid HGN URLs were supplied." }, { status: 400 });
  const host = new URL(SITE.url).host;
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation: absoluteUrl("/indexnow-key.txt"), urlList: urls }),
  });
  const text = await response.text().catch(() => "");
  if (!response.ok && response.status !== 202) return NextResponse.json({ configured: true, submitted: false, status: response.status, error: text || "IndexNow submission failed." }, { status: 502 });
  return NextResponse.json({ configured: true, submitted: true, count: urls.length, status: response.status });
}
