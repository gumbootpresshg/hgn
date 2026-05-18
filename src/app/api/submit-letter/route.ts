import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

type AlertResult = { skipped?: boolean; ok?: boolean; error?: string; reason?: string };

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 4;
const buckets = new Map<string, { count: number; resetAt: number }>();

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function clean(value: unknown, max = 4000) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

function getIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  const current = buckets.get(ip);
  if (!current || current.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  current.count += 1;
  return current.count <= MAX_REQUESTS;
}

async function sendEmailAlert(payload: { name: string; town: string; email: string; letter: string; submissionId?: string }): Promise<AlertResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.HGN_ALERT_EMAIL_TO;
  const from = process.env.HGN_ALERT_EMAIL_FROM || "HGN Alerts <onboarding@resend.dev>";
  if (!apiKey || !to) return { skipped: true, reason: "Email alert env vars are not configured" };

  const preview = payload.letter.slice(0, 900);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject: "New Letter to the Editor submitted",
      text: `A new Letter to the Editor was submitted.\n\nName: ${payload.name}\nTown: ${payload.town || "Not provided"}\nEmail: ${payload.email}\nSubmission ID: ${payload.submissionId || "pending"}\n\nPreview:\n${preview}`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { skipped: false, error: body || `Resend returned ${response.status}` };
  }
  return { skipped: false, ok: true };
}

async function sendSmsEmailAlert(payload: { name: string; town: string; email: string; letter: string; submissionId?: string }): Promise<AlertResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.HGN_ALERT_SMS_EMAIL;
  const from = process.env.HGN_ALERT_EMAIL_FROM || "HGN Alerts <onboarding@resend.dev>";
  if (!apiKey || !to) return { skipped: true, reason: "Phone/SMS email env vars are not configured" };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject: "HGN letter",
      text: `New letter from ${payload.name}. ${payload.town || ""}. ${payload.email}. ${payload.letter.slice(0, 240)}`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { skipped: false, error: body || `SMS email returned ${response.status}` };
  }
  return { skipped: false, ok: true };
}

export async function POST(request: Request) {
  const ip = getIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many submissions. Please try again in a minute." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  if (clean(body.website, 200)) return NextResponse.json({ ok: true });

  const name = clean(body.name, 160);
  const town = clean(body.town, 160);
  const email = clean(body.email, 240);
  const letter = clean(body.letter, 8000);

  if (!name || !email || !letter || letter.length < 20) {
    return NextResponse.json({ error: "Please include your name, email, and letter." }, { status: 400 });
  }

  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Submission service is not configured." }, { status: 500 });

  const ipHash = createHash("sha256").update(`${ip}:${process.env.HGN_ALERT_SECRET || "hgn"}`).digest("hex");
  const userAgent = request.headers.get("user-agent") || "unknown";

  const { data, error } = await supabase
    .from("letters_to_editor")
    .insert({ name, town, email, letter, status: "new", ip_hash: ipHash, user_agent: userAgent, alert_status: "pending" })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const submissionId = data?.id as string | undefined;
  const emailResult = await sendEmailAlert({ name, town, email, letter, submissionId });
  const smsResult = await sendSmsEmailAlert({ name, town, email, letter, submissionId });
  const alertStatus = emailResult.ok || smsResult.ok ? "sent" : emailResult.skipped && smsResult.skipped ? "not_configured" : "failed";

  await supabase.from("submission_alert_log").insert({
    submission_type: "letter_to_editor",
    submission_id: submissionId,
    recipient: process.env.HGN_ALERT_EMAIL_TO || process.env.HGN_ALERT_SMS_EMAIL || null,
    channel: smsResult.ok ? "email+phone" : "email",
    status: alertStatus,
    error_message: emailResult.error || smsResult.error || emailResult.reason || smsResult.reason || null,
    payload_preview: `${name} — ${letter.slice(0, 300)}`,
  });

  await supabase.from("letters_to_editor").update({ alert_status: alertStatus }).eq("id", submissionId);

  return NextResponse.json({ ok: true, alertStatus });
}
