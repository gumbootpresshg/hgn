import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getLiveDeskSnapshot, liveDeskTone, liveDeskToneClasses } from "@/lib/live-desk";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addStory(formData: FormData) {
  "use server";
  const story_title = String(formData.get("story_title") || "").trim();
  if (!story_title) return;
  await supabase.from("live_desk_stories").insert({
    story_title,
    story_slug: String(formData.get("story_slug") || "").trim() || null,
    status: String(formData.get("status") || "watching"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    banner_text: String(formData.get("banner_text") || "").trim() || null,
    pinned: formData.get("pinned") === "on",
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function addUpdate(formData: FormData) {
  "use server";
  const update_title = String(formData.get("update_title") || "").trim();
  if (!update_title) return;
  const status = String(formData.get("status") || "draft");
  await supabase.from("live_desk_updates").insert({
    story_id: String(formData.get("story_id") || "") || null,
    update_title,
    update_body: String(formData.get("update_body") || "").trim() || null,
    source_note: String(formData.get("source_note") || "").trim() || null,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  });
}

async function addTask(formData: FormData) {
  "use server";
  const task_label = String(formData.get("task_label") || "").trim();
  if (!task_label) return;
  await supabase.from("live_desk_tasks").insert({
    task_label,
    task_type: String(formData.get("task_type") || "live_check"),
    status: String(formData.get("status") || "todo"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status || !["live_desk_stories", "live_desk_updates", "live_desk_tasks"].includes(table)) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (table === "live_desk_updates" && status === "published") patch.published_at = new Date().toISOString();
  if (table === "live_desk_tasks" && ["done", "closed"].includes(status)) patch.completed_at = new Date().toISOString();
  if (table === "live_desk_stories" && ["closed", "resolved"].includes(status)) patch.closed_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm text-slate-600">{label}</div>;
}

export default async function LiveDeskPage() {
  const snapshot = await getLiveDeskSnapshot();
  const scoreTone = snapshot.score >= 80 ? "good" : snapshot.score >= 55 ? "warn" : "bad";
  const stats = [
    ["Live ready", `${snapshot.score}%`, "Rolling update readiness", scoreTone],
    ["Open stories", snapshot.openStories.length, "Current items being watched", snapshot.openStories.length > 4 ? "warn" : "good"],
    ["Draft updates", snapshot.draftUpdates.length, "Updates not published yet", snapshot.draftUpdates.length ? "warn" : "good"],
    ["Urgent", snapshot.urgent.length, "Urgent or blocked live items", snapshot.urgent.length ? "bad" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v95 Admin/Editor Workflow</p>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Live Desk</h1>
        <p className="mt-3 max-w-3xl text-slate-700">A small rolling-update desk for breaking news, urgent notices and homepage status banners.</p>
      </div>
      <div className="flex flex-wrap gap-2"><Link href="/admin/fast-publish" className="hgn-btn-dark">Fast Publish</Link><Link href="/admin/media-flow" className="hgn-btn-dark">Media Flow</Link><Link href="/live-updates" className="hgn-btn-primary">Public updates</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${liveDeskToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Live stories</h2><p className="mt-1 text-sm text-slate-600">Keep this short. Only use it for active situations that need quick updates.</p><div className="mt-4 grid gap-3">{snapshot.stories.length ? snapshot.stories.map((story) => <article key={story.id} className={`rounded-xl border p-4 ${liveDeskToneClasses(liveDeskTone(story.status, story.priority, story.pinned))}`}><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-xs font-black uppercase tracking-wide opacity-70">{story.priority} · {story.status} · {story.owner || "Admin / Editor"}</div>{story.pinned && <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-black">pinned</span>}</div><h3 className="mt-1 text-lg font-black">{story.story_title}</h3>{story.banner_text && <p className="mt-2 rounded-lg bg-white/60 p-2 text-sm font-bold">Banner: {story.banner_text}</p>}{story.notes && <p className="mt-2 text-sm opacity-80">{story.notes}</p>}<StatusButtons table="live_desk_stories" id={story.id} values={["watching", "live", "urgent", "resolved", "closed"]} /></article>) : <Empty label="No live stories yet." />}</div>
        <form action={addStory} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add live story</h3><label>Story title<input name="story_title" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Story slug<input name="story_slug" /></label><label>Owner<input name="owner" defaultValue="Admin / Editor" /></label></div><div className="grid gap-3 md:grid-cols-2"><label>Status<select name="status" defaultValue="watching"><option>watching</option><option>live</option><option>urgent</option><option>resolved</option><option>closed</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label></div><label>Banner text<input name="banner_text" placeholder="Short homepage status banner" /></label><label>Notes<textarea name="notes" rows={3} /></label><label className="flex items-center gap-2 text-sm font-bold"><input name="pinned" type="checkbox" /> Pin for attention</label><button className="hgn-btn-primary">Add live story</button></form>
      </div>

      <div className="grid gap-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Rolling updates</h2><div className="mt-4 grid gap-3">{snapshot.updates.length ? snapshot.updates.map((update) => <article key={update.id} className={`rounded-xl border p-4 ${liveDeskToneClasses(liveDeskTone(update.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{update.status}</div><h3 className="mt-1 font-black">{update.update_title}</h3>{update.update_body && <p className="mt-2 text-sm opacity-80">{update.update_body}</p>}{update.source_note && <p className="mt-2 text-xs font-bold opacity-70">Source: {update.source_note}</p>}<StatusButtons table="live_desk_updates" id={update.id} values={["draft", "review", "published", "closed"]} /></article>) : <Empty label="No rolling updates yet." />}</div><form action={addUpdate} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add update</h3><label>Live story<select name="story_id"><option value="">No linked story</option>{snapshot.stories.map((story) => <option key={story.id} value={story.id}>{story.story_title}</option>)}</select></label><label>Update title<input name="update_title" required /></label><label>Update body<textarea name="update_body" rows={3} /></label><label>Source note<input name="source_note" /></label><label>Status<select name="status" defaultValue="draft"><option>draft</option><option>review</option><option>published</option><option>closed</option></select></label><button className="hgn-btn-primary">Save update</button></form></div>

      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Live checks</h2><div className="mt-4 grid gap-3">{snapshot.tasks.length ? snapshot.tasks.map((task) => <article key={task.id} className={`rounded-xl border p-4 ${liveDeskToneClasses(liveDeskTone(task.status, task.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{task.task_type} · {task.priority} · {task.status}</div><h3 className="mt-1 font-black">{task.task_label}</h3>{task.notes && <p className="mt-2 text-sm opacity-80">{task.notes}</p>}<StatusButtons table="live_desk_tasks" id={task.id} values={["todo", "doing", "done", "blocked"]} /></article>) : <Empty label="No live tasks yet." />}</div><form action={addTask} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add live check</h3><label>Task<input name="task_label" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Type<input name="task_type" defaultValue="live_check" /></label><label>Owner<input name="owner" defaultValue="Admin / Editor" /></label></div><div className="grid gap-3 md:grid-cols-2"><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Status<select name="status" defaultValue="todo"><option>todo</option><option>doing</option><option>done</option><option>blocked</option></select></label></div><label>Notes<textarea name="notes" rows={2} /></label><button className="hgn-btn-primary">Save check</button></form></div></div>
    </section>
  </main>;
}
