import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hasPublisherAccess } from "@/lib/server/publisher-access";
import { DEFAULT_CONTACT_SETTINGS } from "@/lib/contact-settings";

const EMAIL_FIELDS = [
  "contact_email",
  "news_tips_email",
  "advertising_email",
  "subscriptions_email",
  "public_notices_email",
  "obituaries_email",
  "corrections_email",
  "letters_email",
] as const;

async function clients(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) throw new Error("Supabase server settings are incomplete.");

  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/, "");
  if (!token) throw new Error("Login required.");

  const auth = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: { user } } = await auth.auth.getUser(token);
  if (!user) throw new Error("Session could not be verified.");
  if (!(await hasPublisherAccess(auth, user))) throw new Error("Publisher or editor access required.");

  return { db: createClient(url, service, { auth: { persistSession: false } }), user };
}

function email(value: unknown) {
  const out = String(value || "").trim().toLowerCase().slice(0, 254);
  return out || null;
}

export async function GET(req: NextRequest) {
  try {
    const { db } = await clients(req);
    const { data, error } = await db.from("hgn_contact_settings").select("*").eq("singleton_key", "default").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ settings: { ...DEFAULT_CONTACT_SETTINGS, ...(data || {}) } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 403 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { db } = await clients(req);
    const body = await req.json().catch(() => ({}));
    const update: Record<string, unknown> = {
      singleton_key: "default",
      contact_form_enabled: body.contact_form_enabled !== false,
      send_to_operations: body.send_to_operations !== false,
      updated_at: new Date().toISOString(),
    };
    for (const field of EMAIL_FIELDS) update[field] = email(body[field]);

    const { data, error } = await db
      .from("hgn_contact_settings")
      .upsert(update, { onConflict: "singleton_key" })
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, settings: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 403 });
  }
}
