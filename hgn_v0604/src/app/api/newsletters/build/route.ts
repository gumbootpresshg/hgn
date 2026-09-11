import { NextRequest, NextResponse } from "next/server";
import { requirePublisher } from "@/lib/newsletters/server";
import { buildNewsletterContent } from "@/lib/newsletters/builder";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requirePublisher(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const { data: settings } = await auth.db.from("hgn_newsletter_settings").select("*").eq("singleton_key", "default").single();
  if (!settings) return NextResponse.json({ error: "Newsletter settings are missing. Run v272." }, { status: 500 });

  try {
    const built = await buildNewsletterContent({
      db: auth.db,
      settings,
      lookbackDays: Number(body.lookback_days || settings.lookback_days || 14),
      articleIds: Array.isArray(body.article_ids) ? body.article_ids.map(String) : undefined,
    });

    const now = built.to;
    const title = String(body.title || `Haida Gwaii News · ${now.toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Vancouver" })}`);
    const { count } = await auth.db.from("subscribers").select("id", { head: true, count: "exact" }).eq("status", "active").eq("frequency", "biweekly");

    const row = {
      title,
      slug: `newsletter-${now.toISOString().slice(0, 10)}-${Date.now().toString().slice(-5)}`,
      subject_line: String(body.subject || title),
      status: settings.require_approval ? "review" : "draft",
      edition_type: "biweekly",
      audience_segment: "preference_groups",
      intro: String(body.intro || "Here is your latest Haida Gwaii News digest, compiled from the stories and community updates published since our last edition."),
      date_from: built.from.toISOString().slice(0, 10),
      date_to: built.to.toISOString().slice(0, 10),
      content_json: built.content,
      build_diagnostics: built.diagnostics,
      recipient_count: count || 0,
      build_source: String(body.source || "manual"),
    };

    const { data, error } = await auth.db.from("newsletter_editions").insert(row).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await auth.db.from("hgn_newsletter_settings").update({ last_built_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("singleton_key", "default");
    return NextResponse.json({ edition: data, diagnostics: built.diagnostics });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Newsletter build failed." }, { status: 500 });
  }
}
