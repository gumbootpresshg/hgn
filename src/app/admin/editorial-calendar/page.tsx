import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { calendarTone, calendarToneClasses, getEditorialCalendarSnapshot } from "@/lib/editorial-calendar";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createCalendarItem(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("editorial_calendar_items").insert({
    title,
    slug: String(formData.get("slug") || "").trim() || null,
    section: String(formData.get("section") || "news").trim() || "news",
    status: String(formData.get("status") || "planned"),
    priority: String(formData.get("priority") || "normal"),
    publish_date: String(formData.get("publish_date") || new Date().toISOString().slice(0, 10)),
    publish_window: String(formData.get("publish_window") || "anytime"),
    owner: String(formData.get("owner") || "").trim() || null,
    source_notes: String(formData.get("source_notes") || "").trim() || null,
    production_notes: String(formData.get("production_notes") || "").trim() || null,
    homepage_slot: String(formData.get("homepage_slot") || "").trim() || null,
    is_featured: formData.get("is_featured") === "on",
    is_beta_critical: formData.get("is_beta_critical") === "on",
  });
}

async function createBudgetItem(formData: FormData) {
  "use server";
  const story_title = String(formData.get("story_title") || "").trim();
  if (!story_title) return;
  await supabase.from("story_budget_items").insert({
    story_title,
    section: String(formData.get("section") || "news"),
    status: String(formData.get("status") || "idea"),
    assignment_type: String(formData.get("assignment_type") || "article"),
    reporter: String(formData.get("reporter") || "").trim() || null,
    editor: String(formData.get("editor") || "").trim() || null,
    due_date: String(formData.get("due_date") || "") || null,
    expected_publish_date: String(formData.get("expected_publish_date") || "") || null,
    estimated_length: String(formData.get("estimated_length") || "").trim() || null,
    art_needs: String(formData.get("art_needs") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    blocker: String(formData.get("blocker") || "").trim() || null,
  });
}

async function createWindow(formData: FormData) {
  "use server";
  const label = String(formData.get("label") || "").trim();
  if (!label) return;
  await supabase.from("publishing_windows").insert({
    label,
    window_date: String(formData.get("window_date") || new Date().toISOString().slice(0, 10)),
    window_time: String(formData.get("window_time") || "morning"),
    status: String(formData.get("status") || "open"),
    capacity: Number(formData.get("capacity") || 5),
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["editorial_calendar_items", "story_budget_items", "publishing_windows"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

export default async function EditorialCalendarPage() {
  const snapshot = await getEditorialCalendarSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const today = new Date().toISOString().slice(0, 10);
  const stats = [
    ["Calendar readiness", `${snapshot.score}%`, "Planned, ready and beta-critical coverage", signal],
    ["Active stories", snapshot.activeCalendar.length, "Not yet published or killed", snapshot.activeCalendar.length ? "good" : "warn"],
    ["Today", snapshot.todayItems, "Items scheduled for today", snapshot.todayItems ? "good" : "warn"],
    ["Blockers", snapshot.blockers, "Budget items needing attention", snapshot.blockers ? "bad" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v78 Editorial Calendar</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Editorial Calendar</h1><p className="mt-3 max-w-3xl text-slate-700">Plan the beta publishing week, manage story budget items, and make sure the homepage has a reliable daily flow.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/coming-up" className="hgn-btn-primary">Public coming up</Link><Link href="/admin/preflight" className="hgn-btn-dark">Preflight</Link><Link href="/admin/analytics-command" className="hgn-btn-dark">Analytics</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${calendarToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm font-semibold opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Publishing calendar</h2><div className="mt-5 grid gap-3">{snapshot.calendar.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${calendarToneClasses(calendarTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.publish_date} · {item.publish_window} · {item.section} · {item.status} · {item.priority}</div><h3 className="mt-1 text-xl font-black">{item.title}</h3><p className="mt-2 text-sm font-semibold opacity-80">Owner: {item.owner || "Unassigned"}{item.homepage_slot ? ` · Homepage: ${item.homepage_slot}` : ""}{item.is_featured ? " · Featured" : ""}{item.is_beta_critical ? " · Beta critical" : ""}</p>{item.production_notes && <p className="mt-2 text-sm opacity-80">{item.production_notes}</p>}<StatusButtons table="editorial_calendar_items" id={item.id} values={["planned", "draft", "ready", "scheduled", "published", "blocked"]} /></article>)}{!snapshot.calendar.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">No calendar items yet.</p>}</div></div>
      <aside className="grid content-start gap-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Add calendar item</h2><form action={createCalendarItem} className="mt-5 grid gap-3"><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Slug<input name="slug" /></label><label>Section<input name="section" defaultValue="news" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Status<select name="status" defaultValue="planned"><option>planned</option><option>draft</option><option>ready</option><option>scheduled</option><option>published</option><option>blocked</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Publish date<input name="publish_date" type="date" defaultValue={today} /></label></div><div className="grid gap-3 md:grid-cols-2"><label>Window<input name="publish_window" defaultValue="morning" /></label><label>Owner<input name="owner" /></label></div><label>Homepage slot<input name="homepage_slot" placeholder="lead, secondary, community, utility" /></label><label>Source notes<textarea name="source_notes" rows={2} /></label><label>Production notes<textarea name="production_notes" rows={3} /></label><label className="flex items-center gap-2 font-bold"><input name="is_featured" type="checkbox" /> Featured</label><label className="flex items-center gap-2 font-bold"><input name="is_beta_critical" type="checkbox" /> Beta critical</label><button className="hgn-btn-primary">Save calendar item</button></form></div></aside>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Story budget</h2><div className="mt-5 grid gap-3">{snapshot.budget.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${calendarToneClasses(calendarTone(item.blocker ? "blocked" : item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.section} · {item.assignment_type} · {item.status}</div><h3 className="mt-1 font-black">{item.story_title}</h3><p className="mt-2 text-sm font-semibold opacity-80">Reporter: {item.reporter || "TBD"} · Editor: {item.editor || "TBD"} · Due: {item.due_date || "not set"} · Expected: {item.expected_publish_date || "not set"}</p>{item.art_needs && <p className="mt-1 text-sm opacity-80"><b>Art:</b> {item.art_needs}</p>}{item.blocker && <p className="mt-1 text-sm font-black text-hgnBlue">Blocker: {item.blocker}</p>}<StatusButtons table="story_budget_items" id={item.id} values={["idea", "assigned", "draft", "editing", "ready", "blocked"]} /></article>)}</div><form action={createBudgetItem} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add budget item</h3><label>Story title<input name="story_title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Section<input name="section" defaultValue="news" /></label><label>Status<input name="status" defaultValue="idea" /></label><label>Type<input name="assignment_type" defaultValue="article" /></label></div><div className="grid gap-3 md:grid-cols-2"><label>Reporter<input name="reporter" /></label><label>Editor<input name="editor" /></label></div><div className="grid gap-3 md:grid-cols-2"><label>Due date<input name="due_date" type="date" /></label><label>Expected publish<input name="expected_publish_date" type="date" /></label></div><label>Estimated length<input name="estimated_length" /></label><label>Art needs<input name="art_needs" /></label><label>Notes<textarea name="notes" rows={2} /></label><label>Blocker<input name="blocker" /></label><button className="hgn-btn-dark">Save budget item</button></form></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Publishing windows</h2><div className="mt-5 grid gap-3">{snapshot.windows.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${calendarToneClasses(calendarTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.window_date} · {item.window_time} · {item.status}</div><h3 className="mt-1 font-black">{item.label}</h3><p className="mt-2 text-sm font-semibold opacity-80">Capacity: {item.capacity} stories</p>{item.notes && <p className="mt-1 text-sm opacity-80">{item.notes}</p>}<StatusButtons table="publishing_windows" id={item.id} values={["open", "full", "ready", "closed"]} /></article>)}</div><form action={createWindow} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add window</h3><label>Label<input name="label" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Date<input name="window_date" type="date" defaultValue={today} /></label><label>Time<input name="window_time" defaultValue="morning" /></label></div><div className="grid gap-3 md:grid-cols-2"><label>Status<input name="status" defaultValue="open" /></label><label>Capacity<input name="capacity" type="number" defaultValue="5" /></label></div><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save window</button></form></div>
    </section>
  </main>;
}
