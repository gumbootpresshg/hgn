import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { analyticsTone, analyticsToneClasses, getAnalyticsCommandSnapshot } from "@/lib/analytics-command";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createStorySnapshot(formData: FormData) {
  "use server";
  const story_title = String(formData.get("story_title") || "").trim();
  if (!story_title) return;
  await supabase.from("analytics_story_snapshots").insert({
    story_title,
    story_slug: String(formData.get("story_slug") || "").trim() || null,
    section: String(formData.get("section") || "news").trim() || "news",
    status: String(formData.get("status") || "tracking"),
    views: Number(formData.get("views") || 0),
    unique_visitors: Number(formData.get("unique_visitors") || 0),
    newsletter_clicks: Number(formData.get("newsletter_clicks") || 0),
    social_clicks: Number(formData.get("social_clicks") || 0),
    shares_count: Number(formData.get("shares_count") || 0),
    editor_notes: String(formData.get("editor_notes") || "").trim() || null,
  });
}

async function createKpi(formData: FormData) {
  "use server";
  const label = String(formData.get("label") || "").trim();
  if (!label) return;
  await supabase.from("newsroom_kpi_snapshots").insert({
    label,
    category: String(formData.get("category") || "audience"),
    value: Number(formData.get("value") || 0),
    target: formData.get("target") ? Number(formData.get("target")) : null,
    status: String(formData.get("status") || "watch"),
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createSource(formData: FormData) {
  "use server";
  const source_name = String(formData.get("source_name") || "").trim();
  if (!source_name) return;
  await supabase.from("traffic_source_summaries").insert({
    source_name,
    source_type: String(formData.get("source_type") || "referral"),
    status: String(formData.get("status") || "tracking"),
    sessions: Number(formData.get("sessions") || 0),
    visitors: Number(formData.get("visitors") || 0),
    signups: Number(formData.get("signups") || 0),
    top_landing_page: String(formData.get("top_landing_page") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createReview(formData: FormData) {
  "use server";
  const review_title = String(formData.get("review_title") || "").trim();
  if (!review_title) return;
  await supabase.from("beta_engagement_reviews").insert({
    review_title,
    status: String(formData.get("status") || "open"),
    review_period: String(formData.get("review_period") || "weekly"),
    signal: String(formData.get("signal") || "watch"),
    what_worked: String(formData.get("what_worked") || "").trim() || null,
    what_needs_work: String(formData.get("what_needs_work") || "").trim() || null,
    next_action: String(formData.get("next_action") || "").trim() || null,
    owner: String(formData.get("owner") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["analytics_story_snapshots", "traffic_source_summaries", "beta_engagement_reviews", "newsroom_kpi_snapshots"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (table === "beta_engagement_reviews" && ["done", "complete", "completed"].includes(status)) patch.completed_at = new Date().toISOString();
  if (table === "newsroom_kpi_snapshots") delete patch.updated_at;
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

export default async function AnalyticsCommandPage() {
  const snapshot = await getAnalyticsCommandSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Analytics readiness", `${snapshot.score}%`, "Story, KPI and source tracking coverage", signal],
    ["Tracked views", snapshot.totalViews, "Manual beta traffic snapshots", snapshot.totalViews ? "good" : "warn"],
    ["Traffic sources", snapshot.activeSources, "Channels being watched", snapshot.activeSources ? "good" : "warn"],
    ["Open reviews", snapshot.openReviews, "Engagement review loops", snapshot.openReviews ? "warn" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v77 Analytics Command</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Analytics Command</h1><p className="mt-3 max-w-3xl text-slate-700">Track beta engagement, story performance and launch signals without waiting for a full analytics stack to be perfect.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/analytics-overview" className="hgn-btn-primary">Public overview</Link><Link href="/admin/newsletter-desk" className="hgn-btn-dark">Newsletter desk</Link><Link href="/admin/audience-growth" className="hgn-btn-dark">Audience growth</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${analyticsToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm font-semibold opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Story performance</h2><div className="mt-5 grid gap-3">{snapshot.stories.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${analyticsToneClasses(analyticsTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.section} · {item.status} · {item.snapshot_date}</div><h3 className="mt-1 text-xl font-black">{item.story_title}</h3><p className="mt-2 text-sm font-semibold opacity-80">{Number(item.views || 0).toLocaleString()} views · {Number(item.unique_visitors || 0).toLocaleString()} visitors · {Number(item.newsletter_clicks || 0)} newsletter clicks · {Number(item.social_clicks || 0)} social clicks</p>{item.editor_notes && <p className="mt-2 text-sm opacity-80">{item.editor_notes}</p>}<StatusButtons table="analytics_story_snapshots" id={item.id} values={["tracking", "watch", "good", "stale"]} /></article>)}{!snapshot.stories.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">No story snapshots yet.</p>}</div></div>
      <aside className="grid content-start gap-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Add story snapshot</h2><form action={createStorySnapshot} className="mt-5 grid gap-3"><label>Story title<input name="story_title" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Slug<input name="story_slug" /></label><label>Section<input name="section" defaultValue="news" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Status<select name="status" defaultValue="tracking"><option>tracking</option><option>watch</option><option>good</option><option>stale</option></select></label><label>Views<input name="views" type="number" defaultValue="0" /></label><label>Visitors<input name="unique_visitors" type="number" defaultValue="0" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Newsletter clicks<input name="newsletter_clicks" type="number" defaultValue="0" /></label><label>Social clicks<input name="social_clicks" type="number" defaultValue="0" /></label><label>Shares<input name="shares_count" type="number" defaultValue="0" /></label></div><label>Editor notes<textarea name="editor_notes" rows={3} /></label><button className="hgn-btn-primary">Save snapshot</button></form></div><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Add KPI</h2><form action={createKpi} className="mt-5 grid gap-3"><label>Label<input name="label" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Category<input name="category" defaultValue="audience" /></label><label>Status<select name="status" defaultValue="watch"><option>watch</option><option>on_track</option><option>risk</option><option>good</option></select></label></div><div className="grid gap-3 md:grid-cols-2"><label>Value<input name="value" type="number" defaultValue="0" /></label><label>Target<input name="target" type="number" /></label></div><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-dark">Save KPI</button></form></div></aside>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Traffic sources</h2><div className="mt-5 grid gap-3">{snapshot.sources.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${analyticsToneClasses(analyticsTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.source_type} · {item.status}</div><h3 className="mt-1 font-black">{item.source_name}</h3><p className="mt-2 text-sm font-semibold opacity-80">{Number(item.sessions || 0)} sessions · {Number(item.visitors || 0)} visitors · {Number(item.signups || 0)} signups</p>{item.top_landing_page && <p className="mt-1 text-sm opacity-80">Top page: {item.top_landing_page}</p>}<StatusButtons table="traffic_source_summaries" id={item.id} values={["tracking", "good", "watch", "stale"]} /></article>)}</div><form action={createSource} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add traffic source</h3><label>Source<input name="source_name" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Type<input name="source_type" defaultValue="referral" /></label><label>Status<input name="status" defaultValue="tracking" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Sessions<input name="sessions" type="number" defaultValue="0" /></label><label>Visitors<input name="visitors" type="number" defaultValue="0" /></label><label>Signups<input name="signups" type="number" defaultValue="0" /></label></div><label>Top landing page<input name="top_landing_page" /></label><button className="hgn-btn-primary">Save source</button></form></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Engagement reviews</h2><div className="mt-5 grid gap-3">{snapshot.reviews.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${analyticsToneClasses(analyticsTone(item.signal || item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.review_period} · {item.status} · {item.signal}</div><h3 className="mt-1 font-black">{item.review_title}</h3>{item.what_worked && <p className="mt-2 text-sm opacity-80"><b>Worked:</b> {item.what_worked}</p>}{item.what_needs_work && <p className="mt-1 text-sm opacity-80"><b>Needs work:</b> {item.what_needs_work}</p>}{item.next_action && <p className="mt-1 text-sm font-semibold opacity-80">Next: {item.next_action}</p>}<StatusButtons table="beta_engagement_reviews" id={item.id} values={["open", "watch", "done", "blocked"]} /></article>)}</div><form action={createReview} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add review</h3><label>Title<input name="review_title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Status<input name="status" defaultValue="open" /></label><label>Period<input name="review_period" defaultValue="weekly" /></label><label>Signal<input name="signal" defaultValue="watch" /></label></div><label>What worked<textarea name="what_worked" rows={2} /></label><label>What needs work<textarea name="what_needs_work" rows={2} /></label><label>Next action<input name="next_action" /></label><label>Owner<input name="owner" /></label><button className="hgn-btn-dark">Save review</button></form></div>
    </section>
  </main>;
}
