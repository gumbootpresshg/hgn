import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hasPublisherAccess } from "@/lib/server/publisher-access";
import { DEFAULT_PUBLISHING_SETTINGS } from "@/lib/publishing-settings";

const ALLOWED_TIMEZONES = ["America/Vancouver", "America/Edmonton", "America/Winnipeg", "America/Toronto", "America/Halifax", "America/St_Johns", "UTC"];

async function clients(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) throw new Error("Supabase server settings are incomplete.");
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/, "");
  if (!token) throw new Error("Login required.");
  const auth = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
  const { data: { user } } = await auth.auth.getUser(token);
  if (!user) throw new Error("Session could not be verified.");
  if (!(await hasPublisherAccess(auth, user))) throw new Error("Publisher or editor access required.");
  return createClient(url, service, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  try {
    const db = await clients(req);
    const { data, error } = await db.from("hgn_publishing_settings").select("*").eq("singleton_key", "default").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ settings: { ...DEFAULT_PUBLISHING_SETTINGS, ...(data || {}) } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 403 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = await clients(req);
    const body = await req.json().catch(() => ({}));
    const newsroom_timezone = ALLOWED_TIMEZONES.includes(String(body.newsroom_timezone)) ? String(body.newsroom_timezone) : DEFAULT_PUBLISHING_SETTINGS.newsroom_timezone;
    const date_style = ["long", "medium", "iso"].includes(String(body.date_style)) ? String(body.date_style) : "medium";
    const time_style = ["12h", "24h"].includes(String(body.time_style)) ? String(body.time_style) : "12h";
    const { data, error } = await db.from("hgn_publishing_settings").upsert({ singleton_key: "default", newsroom_timezone, date_style, time_style, updated_at: new Date().toISOString() }, { onConflict: "singleton_key" }).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, settings: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 403 });
  }
}
