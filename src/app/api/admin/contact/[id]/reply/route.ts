import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hasPublisherAccess } from "@/lib/server/publisher-access";
import { getContactSettings, destinationForTopic } from "@/lib/contact-settings";

async function clients(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) throw new Error("Supabase server settings are incomplete.");
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/, "");
  if (!token) throw new Error("Login required.");
  const auth = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
  const { data: { user } } = await auth.auth.getUser(token);
  if (!user || !(await hasPublisherAccess(auth, user))) throw new Error("Publisher or editor access required.");
  return { db: createClient(url, service, { auth: { persistSession: false } }), user };
}

function clean(value: unknown, max: number) {
  return String(value || "").trim().slice(0, max);
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { db, user } = await clients(req);
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const reply = clean(body.message, 12000);
    const subjectInput = clean(body.subject, 240);
    if (!reply) return NextResponse.json({ error: "Reply message is required." }, { status: 400 });

    const { data: item, error } = await db
      .from("submission_inbox")
      .select("id, submission_type, title, sender_name, sender_email, payload, reply_count")
      .eq("id", id)
      .eq("submission_type", "contact_message")
      .single();
    if (error || !item) return NextResponse.json({ error: "Contact message was not found." }, { status: 404 });
    if (!item.sender_email) return NextResponse.json({ error: "This message has no reply email address." }, { status: 400 });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "RESEND_API_KEY is not configured." }, { status: 503 });

    const settings = await getContactSettings();
    const topic = String(item.payload?.topic || "General question");
    const staffAddress = destinationForTopic(settings, topic);
    const from = process.env.HGN_ALERT_EMAIL_FROM || `Haida Gwaii News <${staffAddress}>`;
    const subject = subjectInput || `Re: ${String(item.title || "Your message to Haida Gwaii News").replace(/^Contact:\s*/i, "")}`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [item.sender_email],
        reply_to: staffAddress,
        subject,
        text: reply,
      }),
    });
    if (!response.ok) {
      console.error("[Contact Reply] Resend rejected message", response.status);
      return NextResponse.json({ error: "Email delivery failed. Check the configured sender/domain in Resend." }, { status: 502 });
    }

    const now = new Date().toISOString();
    const nextPayload = {
      ...(item.payload || {}),
      last_reply_by: user.email || user.id,
      last_reply_preview: reply.slice(0, 300),
    };
    await db.from("submission_inbox").update({
      status: "replied",
      read_at: now,
      replied_at: now,
      reply_count: Number(item.reply_count || 0) + 1,
      last_reply_subject: subject,
      payload: nextPayload,
      updated_at: now,
    }).eq("id", id);

    return NextResponse.json({ ok: true, replied_at: now });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Reply failed." }, { status: 403 });
  }
}
