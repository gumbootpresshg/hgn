import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/newsletters/server";

export const runtime = "nodejs";

async function currentUser(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!url || !anon || !token) return null;
  const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

export async function GET(req: NextRequest) {
  const user = await currentUser(req);
  if (!user?.email) return NextResponse.json({ error: "Login required." }, { status: 401 });
  const db = serviceClient();
  const { data, error } = await db.from("subscribers").select("id,email,name,interests,frequency,status,last_sent_at,send_count,created_at").ilike("email", user.email).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subscriber: data, account_email: user.email });
}

export async function POST(req: NextRequest) {
  const user = await currentUser(req);
  if (!user?.email) return NextResponse.json({ error: "Login required." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const db = serviceClient();
  const patch = body.unsubscribe
    ? { status: "unsubscribed", unsubscribed_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    : {
        email: user.email,
        name: String(body.name || user.user_metadata?.full_name || "").trim() || null,
        interests: Array.isArray(body.interests) ? body.interests.slice(0, 20).map(String) : [],
        frequency: body.frequency === "alerts" ? "alerts" : "biweekly",
        status: "active",
        unsubscribed_at: null,
        consent_source: "account_preferences",
        updated_at: new Date().toISOString(),
      };

  const existing = await db.from("subscribers").select("id").ilike("email", user.email).maybeSingle();
  const result = existing.data?.id
    ? await db.from("subscribers").update(patch).eq("id", existing.data.id).select("id,email,name,interests,frequency,status,last_sent_at,send_count,created_at").single()
    : await db.from("subscribers").insert(patch).select("id,email,name,interests,frequency,status,last_sent_at,send_count,created_at").single();
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ subscriber: result.data });
}
