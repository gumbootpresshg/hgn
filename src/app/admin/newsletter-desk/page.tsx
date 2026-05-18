import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getNewsletterDispatchSnapshot, newsletterTone, newsletterToneClasses } from "@/lib/newsletter-dispatch";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createEdition(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const slug = String(formData.get("slug") || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")).trim();
  await supabase.from("newsletter_editions").insert({
    title,
    slug,
    subject_line: String(formData.get("subject_line") || "").trim() || null,
    status: String(formData.get("status") || "draft"),
    edition_type: String(formData.get("edition_type") || "daily"),
    audience_segment: String(formData.get("audience_segment") || "all_readers"),
    intro: String(formData.get("intro") || "").trim() || null,
    top_story_title: String(formData.get("top_story_title") || "").trim() || null,
    top_story_url: String(formData.get("top_story_url") || "").trim() || null,
    secondary_story_title: String(formData.get("secondary_story_title") || "").trim() || null,
    secondary_story_url: String(formData.get("secondary_story_url") || "").trim() || null,
    sponsor_note: String(formData.get("sponsor_note") || "").trim() || null,
    editor_note: String(formData.get("editor_note") || "").trim() || null,
    published_at: ["published", "sent"].includes(String(formData.get("status") || "")) ? new Date().toISOString() : null,
  });
}

async function createSegment(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await supabase.from("newsletter_segments").insert({
    name,
    description: String(formData.get("description") || "").trim() || null,
    status: String(formData.get("status") || "active"),
    target_reader: String(formData.get("target_reader") || "").trim() || null,
    estimated_recipients: Number(formData.get("estimated_recipients") || 0),
    source: String(formData.get("source") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createTask(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("newsletter_dispatch_tasks").insert({
    title,
    phase: String(formData.get("phase") || "prep"),
    status: String(formData.get("status") || "todo"),
    owner: String(formData.get("owner") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["newsletter_editions", "newsletter_segments", "newsletter_dispatch_tasks"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (table === "newsletter_editions" && ["sent", "published"].includes(status)) {
    patch.sent_at = new Date().toISOString();
    patch.published_at = new Date().toISOString();
  }
  if (table === "newsletter_dispatch_tasks" && ["done", "complete"].includes(status)) patch.completed_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

export default async function NewsletterDeskPage() {
  const snapshot = await getNewsletterDispatchSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Dispatch readiness", `${snapshot.score}%`, "Segments, editions, checklist and metrics", signal],
    ["Draft editions", snapshot.draftEditions, "Newsletters being prepared", snapshot.draftEditions ? "warn" : "neutral"],
    ["Sent editions", snapshot.sentEditions, "Published or sent newsletters", snapshot.sentEditions ? "good" : "warn"],
    ["Open tasks", snapshot.openTasks, "Dispatch checklist items remaining", snapshot.openTasks ? "warn" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v76 Newsletter Dispatch</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Newsletter Desk</h1><p className="mt-3 max-w-3xl text-slate-700">Plan, QA and track HGN beta newsletter sends so reader updates become a repeatable publishing habit.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/newsletter-archive" className="hgn-btn-primary">Public archive</Link><Link href="/newsletter" className="hgn-btn-dark">Signup page</Link><Link href="/admin/audience-growth" className="hgn-btn-dark">Audience growth</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${newsletterToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm font-semibold opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Editions</h2><div className="mt-5 grid gap-3">{snapshot.editions.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${newsletterToneClasses(newsletterTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.edition_type} · {item.audience_segment} · {item.status}</div><h3 className="mt-1 text-xl font-black">{item.title}</h3>{item.subject_line && <p className="mt-1 text-sm font-semibold opacity-80">Subject: {item.subject_line}</p>}{item.intro && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{item.intro}</p>}{item.top_story_title && <p className="mt-2 text-sm font-bold opacity-90">Lead: {item.top_story_title}</p>}{item.sponsor_note && <p className="mt-2 text-sm opacity-80">Sponsor: {item.sponsor_note}</p>}<StatusButtons table="newsletter_editions" id={item.id} values={["draft", "review", "scheduled", "sent", "published"]} /></article>)}{!snapshot.editions.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">No newsletter editions yet.</p>}</div></div>
      <aside className="grid content-start gap-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Create edition</h2><form action={createEdition} className="mt-5 grid gap-3"><label>Title<input name="title" required /></label><label>Slug<input name="slug" /></label><label>Subject line<input name="subject_line" /></label><div className="grid gap-3 md:grid-cols-3"><label>Type<select name="edition_type" defaultValue="daily"><option>daily</option><option>weekly</option><option>breaking</option><option>beta</option><option>sponsor</option></select></label><label>Segment<input name="audience_segment" defaultValue="all_readers" /></label><label>Status<select name="status" defaultValue="draft"><option>draft</option><option>review</option><option>scheduled</option><option>published</option><option>sent</option></select></label></div><label>Intro<textarea name="intro" rows={3} /></label><div className="grid gap-3 md:grid-cols-2"><label>Top story<input name="top_story_title" /></label><label>Top story URL<input name="top_story_url" /></label></div><div className="grid gap-3 md:grid-cols-2"><label>Second story<input name="secondary_story_title" /></label><label>Second story URL<input name="secondary_story_url" /></label></div><label>Sponsor note<textarea name="sponsor_note" rows={2} /></label><label>Editor note<textarea name="editor_note" rows={3} /></label><button className="hgn-btn-primary">Save edition</button></form></div><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Add task</h2><form action={createTask} className="mt-5 grid gap-3"><label>Task<input name="title" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Phase<select name="phase" defaultValue="prep"><option>prep</option><option>editorial</option><option>qa</option><option>dispatch</option><option>followup</option></select></label><label>Status<select name="status" defaultValue="todo"><option>todo</option><option>pending</option><option>done</option><option>blocked</option></select></label></div><label>Owner<input name="owner" /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-dark">Save task</button></form></div></aside>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Audience segments</h2><div className="mt-5 grid gap-3">{snapshot.segments.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${newsletterToneClasses(newsletterTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.status} · {item.estimated_recipients || 0} recipients</div><h3 className="mt-1 font-black">{item.name}</h3>{item.description && <p className="mt-2 text-sm opacity-80">{item.description}</p>}{item.target_reader && <p className="mt-1 text-sm font-semibold opacity-80">Reader: {item.target_reader}</p>}<StatusButtons table="newsletter_segments" id={item.id} values={["active", "paused", "stale"]} /></article>)}</div><form action={createSegment} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add segment</h3><label>Name<input name="name" required /></label><label>Description<textarea name="description" rows={2} /></label><div className="grid gap-3 md:grid-cols-2"><label>Status<input name="status" defaultValue="active" /></label><label>Estimated recipients<input name="estimated_recipients" type="number" defaultValue="0" /></label></div><label>Target reader<input name="target_reader" /></label><label>Source<input name="source" /></label><button className="hgn-btn-primary">Save segment</button></form></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Dispatch checklist</h2><div className="mt-5 grid gap-3">{snapshot.tasks.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${newsletterToneClasses(newsletterTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.phase} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3>{item.owner && <p className="mt-1 text-sm font-semibold opacity-80">Owner: {item.owner}</p>}{item.notes && <p className="mt-2 text-sm opacity-80">{item.notes}</p>}<StatusButtons table="newsletter_dispatch_tasks" id={item.id} values={["todo", "pending", "done", "blocked"]} /></article>)}</div></div>
    </section>
  </main>;
}
