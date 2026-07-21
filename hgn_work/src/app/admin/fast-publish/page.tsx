import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fastPublishTone, fastPublishToneClasses, getFastPublishSnapshot } from "@/lib/fast-publish";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addQueueItem(formData: FormData) {
  "use server";
  const story_title = String(formData.get("story_title") || "").trim();
  if (!story_title) return;
  await supabase.from("fast_publish_queue").insert({
    story_title,
    article_slug: String(formData.get("article_slug") || "").trim() || null,
    source_preset: String(formData.get("source_preset") || "daily_story"),
    queue_status: String(formData.get("queue_status") || "drafting"),
    assigned_to: String(formData.get("assigned_to") || "").trim() || null,
    priority: String(formData.get("priority") || "normal"),
    target_publish_at: String(formData.get("target_publish_at") || "").trim() || null,
    needs_image: formData.get("needs_image") === "on",
    needs_seo: formData.get("needs_seo") === "on",
    needs_copy_check: formData.get("needs_copy_check") === "on",
    needs_homepage_slot: formData.get("needs_homepage_slot") === "on",
    started_at: new Date().toISOString(),
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function addAction(formData: FormData) {
  "use server";
  const action_label = String(formData.get("action_label") || "").trim();
  if (!action_label) return;
  await supabase.from("fast_publish_actions").insert({
    queue_item_id: String(formData.get("queue_item_id") || "").trim() || null,
    action_label,
    action_type: String(formData.get("action_type") || "check"),
    status: String(formData.get("status") || "todo"),
    owner: String(formData.get("owner") || "").trim() || null,
    priority: String(formData.get("priority") || "normal"),
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function saveNote(formData: FormData) {
  "use server";
  const note_label = String(formData.get("note_label") || "").trim();
  if (!note_label) return;
  await supabase.from("fast_publish_notes").insert({
    note_label,
    note_body: String(formData.get("note_body") || "").trim() || null,
    note_type: String(formData.get("note_type") || "handoff"),
    status: String(formData.get("status") || "open"),
    owner: String(formData.get("owner") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status || !["fast_publish_queue", "fast_publish_actions", "fast_publish_notes"].includes(table)) return;
  const patch: Row = { updated_at: new Date().toISOString() };
  if (table === "fast_publish_queue") {
    patch.queue_status = status;
    if (["ready", "ready_now"].includes(status)) patch.ready_at = new Date().toISOString();
    if (status === "published") patch.published_at = new Date().toISOString();
  } else {
    patch.status = status;
    if (["done", "complete", "closed"].includes(status)) patch.completed_at = new Date().toISOString();
  }
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm text-slate-600">{label}</div>;
}

export default async function FastPublishPage() {
  const snapshot = await getFastPublishSnapshot();
  const scoreTone = snapshot.score >= 75 ? "good" : snapshot.score >= 50 ? "warn" : "bad";
  const stats = [
    ["Fast publish ready", `${snapshot.score}%`, "How ready the daily publishing lane looks right now", scoreTone],
    ["Ready now", snapshot.readyQueue.length, "Stories that can move next", snapshot.readyQueue.length ? "good" : "warn"],
    ["Needs attention", snapshot.missingBasics.length, "Open stories missing image, SEO, copy, or homepage work", snapshot.missingBasics.length > 2 ? "bad" : "good"],
    ["Open actions", snapshot.openActions.length, "Small tasks still open", snapshot.openActions.length > 6 ? "warn" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v93 Admin/Editor Workflow</p>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Fast Publish</h1>
        <p className="mt-3 max-w-3xl text-slate-700">A lightweight lane for getting today&apos;s HGN stories from draft to live with fewer clicks and clearer handoff between admin and editor.</p>
      </div>
      <div className="flex flex-wrap gap-2"><Link href="/admin/newsroom" className="hgn-btn-dark">Newsroom</Link><Link href="/admin/homepage-control" className="hgn-btn-dark">Homepage</Link><Link href="/fast-publish-status" className="hgn-btn-primary">Status</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${fastPublishToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Today&apos;s publish lane</h2><p className="mt-1 text-sm text-slate-600">Keep this short. Only add what you realistically want to move today.</p><div className="mt-4 grid gap-3">{snapshot.queue.length ? snapshot.queue.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${fastPublishToneClasses(fastPublishTone(item.queue_status, item.priority))}`}><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.priority} · {item.queue_status} · {item.assigned_to || "unassigned"}</div>{item.source_preset && <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-black">{item.source_preset}</span>}</div><h3 className="mt-1 text-lg font-black">{item.story_title}</h3><p className="mt-1 text-sm opacity-80">{item.article_slug || "No slug yet"}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-black opacity-80">{item.needs_image && <span>needs image</span>}{item.needs_seo && <span>needs SEO</span>}{item.needs_copy_check && <span>needs copy</span>}{item.needs_homepage_slot && <span>needs homepage</span>}</div>{item.notes && <p className="mt-2 text-sm opacity-80">Note: {item.notes}</p>}<StatusButtons table="fast_publish_queue" id={item.id} values={["drafting", "needs_work", "ready", "ready_now", "published", "blocked"]} /></article>) : <Empty label="No fast-publish items yet. Add today&apos;s next story below." />}</div>
        <form action={addQueueItem} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add story to lane</h3><label>Story title<input name="story_title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Preset<select name="source_preset" defaultValue="daily_story">{snapshot.activePresets.map((preset) => <option key={preset.preset_key} value={preset.preset_key}>{preset.preset_label}</option>)}</select></label><label>Status<select name="queue_status" defaultValue="drafting"><option>drafting</option><option>needs_work</option><option>ready</option><option>ready_now</option><option>blocked</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label></div><div className="grid gap-3 md:grid-cols-3"><label>Assigned to<input name="assigned_to" placeholder="Admin / Editor" /></label><label>Slug<input name="article_slug" /></label><label>Target publish time<input name="target_publish_at" type="datetime-local" /></label></div><div className="flex flex-wrap gap-4 text-sm font-bold"><label className="flex items-center gap-2"><input name="needs_image" type="checkbox" /> Needs image</label><label className="flex items-center gap-2"><input name="needs_seo" type="checkbox" defaultChecked /> Needs SEO</label><label className="flex items-center gap-2"><input name="needs_copy_check" type="checkbox" defaultChecked /> Needs copy check</label><label className="flex items-center gap-2"><input name="needs_homepage_slot" type="checkbox" /> Needs homepage slot</label></div><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Add to fast publish</button></form>
      </div>

      <div className="grid gap-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Tiny action list</h2><div className="mt-4 grid gap-3">{snapshot.actions.length ? snapshot.actions.map((action) => <article key={action.id} className={`rounded-xl border p-4 ${fastPublishToneClasses(fastPublishTone(action.status, action.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{action.action_type} · {action.priority} · {action.status}</div><h3 className="mt-1 font-black">{action.action_label}</h3>{action.notes && <p className="mt-2 text-sm opacity-80">{action.notes}</p>}<StatusButtons table="fast_publish_actions" id={action.id} values={["todo", "doing", "done", "blocked"]} /></article>) : <Empty label="No quick actions yet." />}</div><form action={addAction} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add quick action</h3><label>Action<input name="action_label" required placeholder="Attach image / check SEO / update homepage" /></label><div className="grid gap-3 md:grid-cols-2"><label>Type<input name="action_type" defaultValue="check" /></label><label>Owner<input name="owner" placeholder="Admin / Editor" /></label></div><div className="grid gap-3 md:grid-cols-2"><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Status<select name="status" defaultValue="todo"><option>todo</option><option>doing</option><option>done</option><option>blocked</option></select></label></div><label>Notes<textarea name="notes" rows={2} /></label><button className="hgn-btn-primary">Save action</button></form></div>

      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Handoff notes</h2><div className="mt-4 grid gap-3">{snapshot.notes.length ? snapshot.notes.map((note) => <article key={note.id} className="rounded-xl border bg-white p-4"><div className="text-xs font-black uppercase tracking-wide text-slate-500">{note.note_type} · {note.status} · {note.owner || "Admin / Editor"}</div><h3 className="mt-1 font-black text-hgnNavy">{note.note_label}</h3>{note.note_body && <p className="mt-2 text-sm text-slate-700">{note.note_body}</p>}<StatusButtons table="fast_publish_notes" id={note.id} values={["open", "done", "closed"]} /></article>) : <Empty label="No handoff notes yet." />}</div><form action={saveNote} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add handoff note</h3><label>Label<input name="note_label" required /></label><label>Note<textarea name="note_body" rows={3} /></label><div className="grid gap-3 md:grid-cols-3"><label>Type<input name="note_type" defaultValue="handoff" /></label><label>Status<input name="status" defaultValue="open" /></label><label>Owner<input name="owner" placeholder="Admin / Editor" /></label></div><button className="hgn-btn-primary">Save note</button></form></div></div>
    </section>
  </main>;
}
