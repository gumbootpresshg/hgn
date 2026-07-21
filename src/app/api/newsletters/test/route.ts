import { NextRequest, NextResponse } from "next/server";
import { renderNewsletterHtml, requirePublisher } from "@/lib/newsletters/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requirePublisher(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "RESEND_API_KEY is not configured." }, { status: 503 });

  const { edition_id, email } = await req.json().catch(() => ({}));
  const [{ data: edition }, { data: settings }] = await Promise.all([
    auth.db.from("newsletter_editions").select("*").eq("id", edition_id).single(),
    auth.db.from("hgn_newsletter_settings").select("*").eq("singleton_key", "default").single(),
  ]);
  const recipient = String(email || settings?.test_email || "").trim();
  if (!edition || !recipient) return NextResponse.json({ error: "Choose an edition and test email." }, { status: 400 });

  const storyCount = edition.content_json?.articles?.length || 0;
  const eventCount = edition.content_json?.events?.length || 0;
  if (!storyCount && !eventCount) return NextResponse.json({ error: "This edition is empty. Rebuild it before sending a test." }, { status: 409 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://haidagwaiinews.com";
  const html = renderNewsletterHtml({ edition, subscriber: { interests: [], preference_token: "preview" }, siteUrl, logoUrl: `${siteUrl}/brand/hgn-news-seal.png` });
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `${settings.from_name} <${settings.from_email}>`,
      to: [recipient],
      reply_to: settings.reply_to || undefined,
      subject: `TEST: ${edition.subject_line || edition.title}`,
      html,
    }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    await auth.db.from("hgn_newsletter_test_sends").insert({ edition_id: edition.id, email: recipient, status: "failed", error_message: result?.message || `Resend returned ${response.status}` });
    return NextResponse.json({ error: result?.message || `Resend returned ${response.status}`, resend_status: response.status }, { status: 502 });
  }

  await auth.db.from("hgn_newsletter_test_sends").insert({ edition_id: edition.id, email: recipient, status: "accepted", resend_email_id: result?.id || null, accepted_at: new Date().toISOString() });
  return NextResponse.json({ id: result?.id, status: "accepted", message: "Resend accepted the test email. Delivery normally follows within a minute or two." });
}
