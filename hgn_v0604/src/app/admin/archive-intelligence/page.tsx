import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { archiveTone, archiveToneClasses, getArchiveIntelligenceSnapshot } from "@/lib/archive-intelligence";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createTopic(formData: FormData) {
  "use server";
  const topic_name = String(formData.get("topic_name") || "").trim();
  if (!topic_name) return;
  const topic_slug = String(formData.get("topic_slug") || topic_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")).trim();
  await supabase.from("archive_topic_index").insert({
    topic_name,
    topic_slug,
    description: String(formData.get("description") || "").trim() || null,
    era_label: String(formData.get("era_label") || "ongoing"),
    coverage_area: String(formData.get("coverage_area") || "Haida Gwaii"),
    status: String(formData.get("status") || "active"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createQueueItem(formData: FormData) {
  "use server";
  const headline = String(formData.get("headline") || "").trim();
  if (!headline) return;
  await supabase.from("evergreen_resurfacing_queue").insert({
    headline,
    source_url: String(formData.get("source_url") || "").trim() || null,
    topic_name: String(formData.get("topic_name") || "").trim() || null,
    publish_window: String(formData.get("publish_window") || "").trim() || null,
    suggested_channel: String(formData.get("suggested_channel") || "homepage"),
    status: String(formData.get("status") || "queued"),
    priority: String(formData.get("priority") || "normal"),
    reason: String(formData.get("reason") || "").trim() || null,
    owner: String(formData.get("owner") || "").trim() || null,
    target_date: String(formData.get("target_date") || "") || null,
  });
}

async function createQaCheck(formData: FormData) {
  "use server";
  const query = String(formData.get("query") || "").trim();
  if (!query) return;
  await supabase.from("archive_search_qa_checks").insert({
    query,
    expected_result: String(formData.get("expected_result") || "").trim() || null,
    actual_result: String(formData.get("actual_result") || "").trim() || null,
    status: String(formData.get("status") || "needs-review"),
    priority: String(formData.get("priority") || "normal"),
    issue_type: String(formData.get("issue_type") || "relevance"),
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["archive_topic_index", "evergreen_resurfacing_queue", "archive_search_qa_checks", "archive_article_tags"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { updated_at: new Date().toISOString() };
  if (table === "archive_article_tags") patch.verification_status = status;
  else patch.status = status;
  if (table === "archive_search_qa_checks") patch.checked_at = new Date().toISOString();
  if (["done", "complete", "resolved", "published", "verified"].includes(status)) patch.resolved_at = new Date().toISOString();
  if (table === "evergreen_resurfacing_queue" && ["done", "published"].includes(status)) patch.completed_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

export default async function ArchiveIntelligencePage() {
  const snapshot = await getArchiveIntelligenceSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Archive health", `${snapshot.score}%`, "Topic coverage, evergreen queue and search QA", signal],
    ["Active topics", snapshot.activeTopics.length, "Indexed archive themes", snapshot.activeTopics.length ? "good" : "warn"],
    ["Evergreen queue", snapshot.openQueue.length, "Stories to resurface", snapshot.openQueue.length ? "warn" : "good"],
    ["Search QA issues", snapshot.openQa.length, "Archive search checks still open", snapshot.openQa.length ? "bad" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v83 Archive Intelligence</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Archive Intelligence</h1><p className="mt-3 max-w-3xl text-slate-700">Turn old HGN stories into a useful local memory system: topic indexes, archive QA, evergreen resurfacing and historical context planning.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/archive-explorer" className="hgn-btn-primary">Archive explorer</Link><Link href="/admin/editorial-calendar" className="hgn-btn-dark">Editorial calendar</Link><Link href="/admin/analytics-command" className="hgn-btn-dark">Analytics</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${archiveToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm font-semibold opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Topic index</h2><div className="mt-5 grid gap-3">{snapshot.topics.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${archiveToneClasses(archiveTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.topic_slug} · {item.priority} · {item.status}</div><h3 className="mt-1 text-xl font-black">{item.topic_name}</h3><p className="mt-1 text-sm font-semibold opacity-80">{[item.era_label, item.coverage_area, item.owner].filter(Boolean).join(" · ") || "No owner assigned"}</p>{item.description && <p className="mt-2 text-sm opacity-80">{item.description}</p>}{item.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.notes}</p>}<StatusButtons table="archive_topic_index" id={item.id} values={["active", "review", "stale", "archived"]} /></article>)}{!snapshot.topics.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">No archive topics yet.</p>}</div></div>
      <aside className="grid content-start gap-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Add archive topic</h2><form action={createTopic} className="mt-5 grid gap-3"><label>Topic name<input name="topic_name" required placeholder="Ferries and transportation" /></label><label>Slug<input name="topic_slug" placeholder="ferries-transportation" /></label><label>Description<textarea name="description" rows={3} /></label><div className="grid gap-3 md:grid-cols-2"><label>Era<input name="era_label" defaultValue="ongoing" /></label><label>Coverage area<input name="coverage_area" defaultValue="Haida Gwaii" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Status<select name="status" defaultValue="active"><option>active</option><option>review</option><option>stale</option><option>archived</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Owner<input name="owner" /></label></div><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save topic</button></form></div></aside>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Evergreen resurfacing queue</h2><div className="mt-5 grid gap-3">{snapshot.queue.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${archiveToneClasses(archiveTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.suggested_channel} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.headline}</h3><p className="mt-1 text-sm font-semibold opacity-80">{[item.topic_name, item.publish_window, item.target_date].filter(Boolean).join(" · ") || "No timing set"}</p>{item.reason && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.reason}</p>}<StatusButtons table="evergreen_resurfacing_queue" id={item.id} values={["queued", "in progress", "blocked", "published", "done"]} /></article>)}</div><form action={createQueueItem} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add resurfacing idea</h3><label>Headline<input name="headline" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Topic<input name="topic_name" /></label><label>Source URL<input name="source_url" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Channel<select name="suggested_channel" defaultValue="homepage"><option>homepage</option><option>newsletter</option><option>related links</option><option>social</option><option>archive-explorer</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Target date<input name="target_date" type="date" /></label></div><label>Publish window<input name="publish_window" placeholder="Launch week" /></label><label>Reason<textarea name="reason" rows={3} /></label><button className="hgn-btn-dark">Add to queue</button></form></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Search QA</h2><div className="mt-5 grid gap-3">{snapshot.qa.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${archiveToneClasses(archiveTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.issue_type} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">“{item.query}”</h3><p className="mt-1 text-sm font-semibold opacity-80">Expected: {item.expected_result || "Not set"}</p>{item.actual_result && <p className="mt-2 text-sm opacity-80">Actual: {item.actual_result}</p>}{item.notes && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.notes}</p>}<StatusButtons table="archive_search_qa_checks" id={item.id} values={["needs-review", "testing", "resolved", "blocked"]} /></article>)}</div><form action={createQaCheck} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add search QA check</h3><label>Search query<input name="query" required /></label><label>Expected result<input name="expected_result" /></label><label>Actual result<input name="actual_result" /></label><div className="grid gap-3 md:grid-cols-3"><label>Issue type<input name="issue_type" defaultValue="relevance" /></label><label>Status<select name="status" defaultValue="needs-review"><option>needs-review</option><option>testing</option><option>resolved</option><option>blocked</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label></div><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save QA check</button></form></div>
    </section>
  </main>;
}
