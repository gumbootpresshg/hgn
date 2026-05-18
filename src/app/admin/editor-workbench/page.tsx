import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getEditorWorkbenchSnapshot, workbenchTone, workbenchToneClasses } from "@/lib/editor-workbench";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createItem(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("editor_workbench_items").insert({
    title,
    item_type: String(formData.get("item_type") || "article"),
    status: String(formData.get("status") || "draft"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "").trim() || null,
    article_slug: String(formData.get("article_slug") || "").trim() || null,
    checklist: String(formData.get("checklist") || "").trim() || null,
    next_step: String(formData.get("next_step") || "").trim() || null,
    publish_target: String(formData.get("publish_target") || "") || null,
  });
}

async function createNote(formData: FormData) {
  "use server";
  const note = String(formData.get("note") || "").trim();
  if (!note) return;
  await supabase.from("editor_workbench_notes").insert({
    note,
    note_type: String(formData.get("note_type") || "editorial"),
    status: String(formData.get("status") || "open"),
    owner: String(formData.get("owner") || "").trim() || null,
    article_slug: String(formData.get("article_slug") || "").trim() || null,
  });
}

async function createSlot(formData: FormData) {
  "use server";
  const slot_name = String(formData.get("slot_name") || "").trim();
  if (!slot_name) return;
  await supabase.from("homepage_slots").insert({
    slot_name,
    slot_order: Number(formData.get("slot_order") || 0),
    article_title: String(formData.get("article_title") || "").trim() || null,
    article_slug: String(formData.get("article_slug") || "").trim() || null,
    status: String(formData.get("status") || "planned"),
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function createSnapshot(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("draft_recovery_snapshots").insert({
    title,
    article_slug: String(formData.get("article_slug") || "").trim() || null,
    snapshot_body: String(formData.get("snapshot_body") || "").trim() || null,
    saved_by: String(formData.get("saved_by") || "").trim() || null,
    recovery_status: String(formData.get("recovery_status") || "saved"),
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["editor_workbench_items", "editor_workbench_notes", "homepage_slots", "draft_recovery_snapshots"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (["ready", "ready_to_publish", "published", "done", "placed", "recovered"].includes(status)) patch.completed_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

function Empty({ label }: { label: string }) { return <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm text-slate-600">{label}</div>; }

export default async function EditorWorkbenchPage() {
  const snapshot = await getEditorWorkbenchSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  const stats = [
    ["Operator readiness", `${snapshot.score}%`, "Built for a two-person beta desk", signal],
    ["Active items", snapshot.activeItems.length, "Stories or tasks still moving", snapshot.activeItems.length > 10 ? "warn" : "good"],
    ["Ready", snapshot.readyItems.length, "Pieces close to publish", snapshot.readyItems.length ? "good" : "warn"],
    ["Blocked", snapshot.blockedItems.length, "Items stopping the day", snapshot.blockedItems.length ? "bad" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v88 Editor Workbench</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Editor Workbench</h1><p className="mt-3 max-w-3xl text-slate-700">A simpler two-person beta desk for you and the editor: what needs publishing, what blocks the homepage, what notes matter, and what draft text needs backup.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/admin" className="hgn-btn-dark">Admin</Link><Link href="/editor-status" className="hgn-btn-primary">Editor status</Link><Link href="/admin/preflight" className="hgn-btn-dark">Preflight</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${workbenchToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Today&apos;s publishing lane</h2><div className="mt-4 grid gap-3">{snapshot.items.length ? snapshot.items.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${workbenchToneClasses(workbenchTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.item_type} · {item.status} · {item.priority}</div><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-1 text-sm opacity-80">{[item.owner, item.article_slug, item.publish_target].filter(Boolean).join(" · ") || "No owner or target"}</p>{item.next_step && <p className="mt-2 text-sm opacity-80">Next: {item.next_step}</p>}{item.checklist && <p className="mt-2 whitespace-pre-wrap text-xs opacity-70">{item.checklist}</p>}<StatusButtons table="editor_workbench_items" id={item.id} values={["draft", "needs_edit", "ready_to_publish", "published", "blocked"]} /></article>) : <Empty label="No workbench items yet." />}</div><form action={createItem} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add story/task</h3><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-4"><label>Type<input name="item_type" defaultValue="article" /></label><label>Status<select name="status" defaultValue="draft"><option>draft</option><option>needs_edit</option><option>ready_to_publish</option><option>published</option><option>blocked</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Owner<input name="owner" placeholder="You / Editor" /></label></div><div className="grid gap-3 md:grid-cols-2"><label>Article slug<input name="article_slug" /></label><label>Publish target<input name="publish_target" type="datetime-local" /></label></div><label>Next step<textarea name="next_step" rows={2} /></label><label>Checklist<textarea name="checklist" rows={3} placeholder="Image, alt, SEO, homepage, newsletter..." /></label><button className="hgn-btn-primary">Save item</button></form></div>

      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Homepage slots</h2><div className="mt-4 grid gap-3">{snapshot.slots.length ? snapshot.slots.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${workbenchToneClasses(workbenchTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">Slot {item.slot_order} · {item.status}</div><h3 className="mt-1 font-black">{item.slot_name}</h3><p className="mt-1 text-sm opacity-80">{[item.article_title, item.article_slug].filter(Boolean).join(" · ") || "Empty slot"}</p>{item.notes && <p className="mt-2 text-sm opacity-80">{item.notes}</p>}<StatusButtons table="homepage_slots" id={item.id} values={["planned", "placed", "needs_update", "empty", "done"]} /></article>) : <Empty label="No homepage slots planned yet." />}</div><form action={createSlot} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add homepage slot</h3><div className="grid gap-3 md:grid-cols-3"><label>Slot<input name="slot_name" required placeholder="Lead story" /></label><label>Order<input name="slot_order" type="number" defaultValue="1" /></label><label>Status<select name="status" defaultValue="planned"><option>planned</option><option>placed</option><option>needs_update</option><option>empty</option><option>done</option></select></label></div><div className="grid gap-3 md:grid-cols-2"><label>Article title<input name="article_title" /></label><label>Article slug<input name="article_slug" /></label></div><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save slot</button></form></div>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Editor notes</h2><div className="mt-4 grid gap-3">{snapshot.notes.length ? snapshot.notes.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${workbenchToneClasses(workbenchTone(item.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.note_type} · {item.status}</div><p className="mt-1 whitespace-pre-wrap text-sm opacity-90">{item.note}</p><p className="mt-2 text-xs opacity-70">{[item.owner, item.article_slug].filter(Boolean).join(" · ")}</p><StatusButtons table="editor_workbench_notes" id={item.id} values={["open", "doing", "done", "archived"]} /></article>) : <Empty label="No editor notes yet." />}</div><form action={createNote} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add note</h3><label>Note<textarea name="note" rows={3} required /></label><div className="grid gap-3 md:grid-cols-4"><label>Type<input name="note_type" defaultValue="editorial" /></label><label>Status<select name="status" defaultValue="open"><option>open</option><option>doing</option><option>done</option><option>archived</option></select></label><label>Owner<input name="owner" /></label><label>Article slug<input name="article_slug" /></label></div><button className="hgn-btn-primary">Save note</button></form></div>

      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Draft recovery</h2><div className="mt-4 grid gap-3">{snapshot.snapshots.length ? snapshot.snapshots.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${workbenchToneClasses(workbenchTone(item.recovery_status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.recovery_status}</div><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-1 text-xs opacity-70">{[item.article_slug, item.saved_by].filter(Boolean).join(" · ")}</p>{item.snapshot_body && <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm opacity-80">{item.snapshot_body}</p>}<StatusButtons table="draft_recovery_snapshots" id={item.id} values={["saved", "recovered", "archived"]} /></article>) : <Empty label="No recovery snapshots yet." />}</div><form action={createSnapshot} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Save draft backup</h3><label>Title<input name="title" required /></label><div className="grid gap-3 md:grid-cols-3"><label>Article slug<input name="article_slug" /></label><label>Saved by<input name="saved_by" /></label><label>Status<select name="recovery_status" defaultValue="saved"><option>saved</option><option>recovered</option><option>archived</option></select></label></div><label>Draft text<textarea name="snapshot_body" rows={6} /></label><button className="hgn-btn-primary">Save backup</button></form></div>
    </section>
  </main>;
}
