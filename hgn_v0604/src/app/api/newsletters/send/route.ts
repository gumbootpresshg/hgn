import { NextRequest, NextResponse } from "next/server";
import { renderNewsletterHtml, requirePublisher } from "@/lib/newsletters/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const auth = await requirePublisher(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "RESEND_API_KEY is not configured." }, { status: 503 });

  const { edition_id } = await req.json().catch(() => ({}));
  const [{ data: edition }, { data: settings }, { data: subscribers }] = await Promise.all([
    auth.db.from("newsletter_editions").select("*").eq("id", edition_id).single(),
    auth.db.from("hgn_newsletter_settings").select("*").eq("singleton_key", "default").single(),
    auth.db.from("subscribers").select("id,email,name,interests,preference_token").eq("status", "active").eq("frequency", "biweekly").limit(1000),
  ]);
  if (!edition || !settings) return NextResponse.json({ error: "Edition or settings not found." }, { status: 404 });
  if (edition.status === "sent") return NextResponse.json({ error: "This edition is already marked sent." }, { status: 409 });
  if (!(edition.content_json?.articles?.length || edition.content_json?.events?.length)) return NextResponse.json({ error: "This edition is empty. Rebuild it before sending." }, { status: 409 });

  const people = (subscribers || []).filter((item: any) => item.email);
  if (!people.length) return NextResponse.json({ error: "There are no active biweekly subscribers to send to." }, { status: 409 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://haidagwaiinews.com";
  let sent = 0;
  let failed = 0;
  const batchIds: any[] = [];

  for (let index = 0; index < people.length; index += 100) {
    const chunk = people.slice(index, index + 100);
    const payload = chunk.map((person: any) => ({
      from: `${settings.from_name} <${settings.from_email}>`,
      to: [person.email],
      reply_to: settings.reply_to || undefined,
      subject: edition.subject_line || edition.title,
      html: renderNewsletterHtml({ edition, subscriber: person, siteUrl, logoUrl: `${siteUrl}/brand/hgn-news-seal.png` }),
    }));
    const response = await fetch("https://api.resend.com/emails/batch", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => null);
    if (response.ok) {
      sent += chunk.length;
      batchIds.push(result);
      await auth.db.from("hgn_newsletter_deliveries").upsert(chunk.map((person: any) => ({ edition_id: edition.id, subscriber_id: person.id, email: person.email, status: "accepted", sent_at: new Date().toISOString() })), { onConflict: "edition_id,email" });
    } else {
      failed += chunk.length;
      await auth.db.from("hgn_newsletter_deliveries").upsert(chunk.map((person: any) => ({ edition_id: edition.id, subscriber_id: person.id, email: person.email, status: "failed", error_message: result?.message || `Resend ${response.status}` })), { onConflict: "edition_id,email" });
    }
  }

  const now = new Date().toISOString();
  await Promise.all([
    auth.db.from("newsletter_editions").update({ status: failed && !sent ? "failed" : "sent", sent_at: sent ? now : null, published_at: sent ? now : null, delivered_count: sent, failed_count: failed, resend_batch_ids: batchIds }).eq("id", edition.id),
    sent ? auth.db.from("hgn_newsletter_settings").update({ last_sent_at: now, updated_at: now }).eq("singleton_key", "default") : Promise.resolve(),
  ]);
  if (sent) await auth.db.from("subscribers").update({ last_sent_at: now }).in("id", people.map((person: any) => person.id));
  return NextResponse.json({ sent, failed, total: people.length, status: failed && !sent ? "failed" : "accepted" });
}
