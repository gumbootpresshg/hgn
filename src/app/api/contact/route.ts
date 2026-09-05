import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { notifyHgnOperations } from "@/lib/hgn-operations-notify";
import { destinationForTopic, getContactSettings } from "@/lib/contact-settings";

const ALLOWED_TOPICS = new Set([
  "General question",
  "News tip",
  "Advertising",
  "Subscription",
  "Public notice",
  "Obituary",
  "Correction",
  "Letter to the editor",
]);

function clean(value: unknown, max: number) {
  return String(value || "").trim().slice(0, max);
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function sendStaffNotification(payload: {
  destination: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  submissionId: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.HGN_ALERT_EMAIL_FROM || "Haida Gwaii News <onboarding@resend.dev>";
  if (!apiKey || !payload.destination) return { skipped: true };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [payload.destination],
      reply_to: payload.email,
      subject: `HGN contact: ${payload.topic}`,
      text: [
        `New contact message from ${payload.name}.`,
        "",
        `Topic: ${payload.topic}`,
        `Email: ${payload.email}`,
        `Submission ID: ${payload.submissionId}`,
        "",
        payload.message,
      ].join("\n"),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("[Contact] Staff notification failed", response.status);
    return { skipped: false, ok: false };
  }

  return { skipped: false, ok: true };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Please complete the contact form." }, { status: 400 });
    }

    if (clean(body.website, 500)) {
      return NextResponse.json({ ok: true });
    }

    const settings = await getContactSettings();
    if (!settings.contact_form_enabled) {
      return NextResponse.json({ error: "The contact form is temporarily unavailable. Please use the email or phone number shown on this page." }, { status: 503 });
    }

    const name = clean(body.name, 120);
    const email = clean(body.email, 254).toLowerCase();
    const topicCandidate = clean(body.topic, 80);
    const topic = ALLOWED_TOPICS.has(topicCandidate) ? topicCandidate : "General question";
    const message = clean(body.message, 10000);

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
    }
    if (!validEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (message.length < 5) {
      return NextResponse.json({ error: "Please enter a little more detail in your message." }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      console.error("[Contact] Supabase server configuration is incomplete.");
      return NextResponse.json({ error: "The contact form is temporarily unavailable. Please try again shortly." }, { status: 503 });
    }

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const now = new Date().toISOString();
    const destination = destinationForTopic(settings, topic);
    const { data, error } = await supabase
      .from("submission_inbox")
      .insert({
        submission_type: "contact_message",
        title: `Contact: ${topic}`,
        sender_name: name,
        sender_email: email,
        message,
        payload: { topic, source: "contact_page", destination_email: destination },
        status: "new",
        priority: topic === "Advertising" ? "high" : "normal",
        created_at: now,
        updated_at: now,
      })
      .select("id, created_at")
      .single();

    if (error || !data?.id) {
      console.error("[Contact] Could not save contact submission", error?.code || "unknown_db_error");
      return NextResponse.json({ error: "We could not save your message. Please try again." }, { status: 500 });
    }

    try {
      await sendStaffNotification({
        destination,
        name,
        email,
        topic,
        message,
        submissionId: String(data.id),
      });
    } catch (error) {
      console.error("[Contact] Email notification failed for saved submission", String(data.id));
    }

    if (settings.send_to_operations) {
      try {
        await notifyHgnOperations({
          submissionType: "contact_message",
          sourceId: String(data.id),
          title: `Contact: ${topic}`,
          submitterName: name,
          submitterEmail: email,
          summary: message.slice(0, 300),
          publicAdminUrl: `https://haidagwaiinews.com/admin/submissions?contact=${encodeURIComponent(String(data.id))}`,
          receivedAt: data.created_at || now,
          metadata: { topic, source: "contact_page" },
        });
      } catch (error) {
        console.error("[Contact] Operations notification failed for saved submission", String(data.id));
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Contact] Unexpected contact form error", error instanceof Error ? error.name : "unknown_error");
    return NextResponse.json({ error: "We could not send your message. Please try again." }, { status: 500 });
  }
}
