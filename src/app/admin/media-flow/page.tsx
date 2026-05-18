import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getMediaFlowSnapshot, mediaFlowTone, mediaFlowToneClasses } from "@/lib/media-flow";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addMediaItem(formData: FormData) {
  "use server";
  const item_title = String(formData.get("item_title") || "").trim();
  if (!item_title) return;
  await supabase.from("media_flow_items").insert({
    item_title,
    article_slug: String(formData.get("article_slug") || "").trim() || null,
    image_url: String(formData.get("image_url") || "").trim() || null,
    credit: String(formData.get("credit") || "").trim() || null,
    caption: String(formData.get("caption") || "").trim() || null,
    alt_text: String(formData.get("alt_text") || "").trim() || null,
    status: String(formData.get("status") || "needs_review"),
    assigned_to: String(formData.get("assigned_to") || "").trim() || null,
    priority: String(formData.get("priority") || "normal"),
    needs_credit: formData.get("needs_credit") === "on",
    needs_caption: formData.get("needs_caption") === "on",
    needs_alt_text: formData.get("needs_alt_text") === "on",
    needs_crop_check: formData.get("needs_crop_check") === "on",
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function addTask(formData: FormData) {
  "use server";
  const task_label = String(formData.get("task_label") || "").trim();
  if (!task_label) return;
  await supabase.from("media_flow_tasks").insert({
    task_label,
    task_type: String(formData.get("task_type") || "media_check"),
    status: String(formData.get("status") || "todo"),
    owner: String(formData.get("owner") || "").trim() || null,
    priority: String(formData.get("priority") || "normal"),
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status || !["media_flow_items", "media_flow_tasks"].includes(table)) return;
  const patch: Row = { updated_at: new Date().toISOString() };
  patch.status = status;
  if (["done", "complete", "approved", "closed"].includes(status)) patch.completed_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm text-slate-600">{label}</div>;
}

export default async function MediaFlowPage() {
  const snapshot = await getMediaFlowSnapshot();
  const scoreTone = snapshot.score >= 75 ? "good" : snapshot.score >= 50 ? "warn" : "bad";
  const stats = [
    ["Media ready", `${snapshot.score}%`, "Credit, caption, alt text and crop readiness", scoreTone],
    ["Needs cleanup", snapshot.missingBasics.length, "Open images missing publishing basics", snapshot.missingBasics.length ? "warn" : "good"],
    ["Open tasks", snapshot.openTasks.length, "Small media tasks still open", snapshot.openTasks.length > 5 ? "warn" : "good"],
    ["Blocked", snapshot.blocked.length, "Urgent or blocked media items", snapshot.blocked.length ? "bad" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v94 Admin/Editor Workflow</p>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Media Flow</h1>
        <p className="mt-3 max-w-3xl text-slate-700">A small image cleanup desk for credits, captions, alt text and mobile crop checks before stories hit the homepage.</p>
      </div>
      <div className="flex flex-wrap gap-2"><Link href="/admin/fast-publish" className="hgn-btn-dark">Fast Publish</Link><Link href="/admin/homepage-control" className="hgn-btn-dark">Homepage</Link><Link href="/media-flow-status" className="hgn-btn-primary">Status</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${mediaFlowToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Image cleanup queue</h2><p className="mt-1 text-sm text-slate-600">Keep only the images that need a decision today.</p><div className="mt-4 grid gap-3">{snapshot.items.length ? snapshot.items.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${mediaFlowToneClasses(mediaFlowTone(item.status, item.priority))}`}><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.priority} · {item.status} · {item.assigned_to || "Admin / Editor"}</div>{item.article_slug && <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-black">{item.article_slug}</span>}</div><h3 className="mt-1 text-lg font-black">{item.item_title}</h3><div className="mt-3 flex flex-wrap gap-2 text-xs font-black opacity-80">{item.needs_credit && <span>needs credit</span>}{item.needs_caption && <span>needs caption</span>}{item.needs_alt_text && <span>needs alt text</span>}{item.needs_crop_check && <span>check mobile crop</span>}</div>{item.credit && <p className="mt-2 text-sm opacity-80">Credit: {item.credit}</p>}{item.caption && <p className="mt-1 text-sm opacity-80">Caption: {item.caption}</p>}{item.alt_text && <p className="mt-1 text-sm opacity-80">Alt: {item.alt_text}</p>}{item.notes && <p className="mt-2 text-sm opacity-80">Note: {item.notes}</p>}<StatusButtons table="media_flow_items" id={item.id} values={["needs_review", "needs_work", "ready", "approved", "blocked"]} /></article>) : <Empty label="No media items yet. Add an image that needs credit, caption, alt text or crop review." />}</div>
        <form action={addMediaItem} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add image check</h3><label>Item title<input name="item_title" required /></label><div className="grid gap-3 md:grid-cols-2"><label>Article slug<input name="article_slug" /></label><label>Image URL<input name="image_url" /></label></div><div className="grid gap-3 md:grid-cols-3"><label>Status<select name="status" defaultValue="needs_review"><option>needs_review</option><option>needs_work</option><option>ready</option><option>approved</option><option>blocked</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Assigned to<input name="assigned_to" placeholder="Admin / Editor" /></label></div><label>Credit<input name="credit" /></label><label>Caption<textarea name="caption" rows={2} /></label><label>Alt text<textarea name="alt_text" rows={2} /></label><div className="flex flex-wrap gap-4 text-sm font-bold"><label className="flex items-center gap-2"><input name="needs_credit" type="checkbox" defaultChecked /> Needs credit</label><label className="flex items-center gap-2"><input name="needs_caption" type="checkbox" defaultChecked /> Needs caption</label><label className="flex items-center gap-2"><input name="needs_alt_text" type="checkbox" defaultChecked /> Needs alt text</label><label className="flex items-center gap-2"><input name="needs_crop_check" type="checkbox" /> Check crop</label></div><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Add media check</button></form>
      </div>

      <div className="grid gap-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Quick media tasks</h2><div className="mt-4 grid gap-3">{snapshot.tasks.length ? snapshot.tasks.map((task) => <article key={task.id} className={`rounded-xl border p-4 ${mediaFlowToneClasses(mediaFlowTone(task.status, task.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{task.task_type} · {task.priority} · {task.status}</div><h3 className="mt-1 font-black">{task.task_label}</h3>{task.notes && <p className="mt-2 text-sm opacity-80">{task.notes}</p>}<StatusButtons table="media_flow_tasks" id={task.id} values={["todo", "doing", "done", "blocked"]} /></article>) : <Empty label="No media tasks yet." />}</div><form action={addTask} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add media task</h3><label>Task<input name="task_label" required placeholder="Check hero image crop" /></label><div className="grid gap-3 md:grid-cols-2"><label>Type<input name="task_type" defaultValue="media_check" /></label><label>Owner<input name="owner" placeholder="Admin / Editor" /></label></div><div className="grid gap-3 md:grid-cols-2"><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Status<select name="status" defaultValue="todo"><option>todo</option><option>doing</option><option>done</option><option>blocked</option></select></label></div><label>Notes<textarea name="notes" rows={2} /></label><button className="hgn-btn-primary">Save task</button></form></div>

      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Simple image rules</h2><div className="mt-4 grid gap-3">{snapshot.activeGuidelines.map((rule) => <article key={rule.id} className="rounded-xl border bg-white p-4"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Rule {rule.sort_order}</div><h3 className="mt-1 font-black text-hgnNavy">{rule.guideline_label}</h3><p className="mt-2 text-sm text-slate-700">{rule.guideline_body}</p></article>)}</div></div></div>
    </section>
  </main>;
}
