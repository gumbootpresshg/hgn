import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getNewsroomStreamlineSnapshot, newsroomTone, newsroomToneClasses } from "@/lib/newsroom-streamline";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function createQueueItem(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await supabase.from("newsroom_queue_items").insert({
    title,
    article_slug: String(formData.get("article_slug") || "").trim() || null,
    queue_area: String(formData.get("queue_area") || "publishing"),
    owner: String(formData.get("owner") || "").trim() || null,
    status: String(formData.get("status") || "needs_attention"),
    priority: String(formData.get("priority") || "normal"),
    next_step: String(formData.get("next_step") || "").trim() || null,
    homepage_candidate: formData.get("homepage_candidate") === "on",
    publish_today: formData.get("publish_today") === "on",
  });
}

async function createNote(formData: FormData) {
  "use server";
  const note_title = String(formData.get("note_title") || "").trim();
  if (!note_title) return;
  await supabase.from("newsroom_notes").insert({
    note_title,
    note_body: String(formData.get("note_body") || "").trim() || null,
    note_type: String(formData.get("note_type") || "sticky"),
    owner: String(formData.get("owner") || "").trim() || null,
    status: String(formData.get("status") || "open"),
    pinned: formData.get("pinned") === "on",
  });
}

async function createHomepageSlot(formData: FormData) {
  "use server";
  const slot_name = String(formData.get("slot_name") || "").trim();
  if (!slot_name) return;
  await supabase.from("newsroom_homepage_controls").insert({
    slot_name,
    story_title: String(formData.get("story_title") || "").trim() || null,
    article_slug: String(formData.get("article_slug") || "").trim() || null,
    slot_order: Number(formData.get("slot_order") || 0),
    status: String(formData.get("status") || "planned"),
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateStatus(formData: FormData) {
  "use server";
  const table = String(formData.get("table") || "");
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["newsroom_queue_items", "newsroom_notes", "newsroom_homepage_controls"];
  if (!allowed.includes(table) || !id || !status) return;
  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (["done", "published", "closed", "filled"].includes(status)) patch.completed_at = new Date().toISOString();
  await supabase.from(table).update(patch).eq("id", id);
}

function StatusButtons({ table, id, values }: { table: string; id: string; values: string[] }) {
  return <form action={updateStatus} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />{values.map((value) => <button key={value} name="status" value={value} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">{value}</button>)}</form>;
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm text-slate-600">{label}</div>;
}

export default async function NewsroomPage() {
  const snapshot = await getNewsroomStreamlineSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 50 ? "warn" : "bad";
  const stats = [
    ["Newsroom flow", `${snapshot.score}%`, "How clean today feels for the two-person beta desk", signal],
    ["Needs attention", snapshot.needsAttention.length, "Only keep real blockers here", snapshot.needsAttention.length > 6 ? "warn" : "good"],
    ["Publish today", snapshot.publishToday.length, "Stories or tasks marked for today", snapshot.publishToday.length > 5 ? "warn" : "good"],
    ["Homepage ready", snapshot.homepageReady.length, "Filled homepage slots", snapshot.homepageReady.length >= 2 ? "good" : "warn"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v90 Two-person Newsroom</p>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Newsroom Streamline</h1>
        <p className="mt-3 max-w-3xl text-slate-700">A simpler admin home base for the current beta reality: just the HGN admin and editor. Keep the queue small, keep the homepage current, and move stories to publish with fewer clicks.</p>
      </div>
      <div className="flex flex-wrap gap-2"><Link href="/admin/daily-command" className="hgn-btn-dark">Daily command</Link><Link href="/admin/editor-workbench" className="hgn-btn-dark">Editor workbench</Link><Link href="/newsroom-status" className="hgn-btn-primary">Status</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${newsroomToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Publishing queue</h2><p className="mt-1 text-sm text-slate-600">Use this as the short list for what actually matters today.</p><div className="mt-4 grid gap-3">{snapshot.queue.length ? snapshot.queue.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${newsroomToneClasses(newsroomTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.queue_area} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-1 text-sm opacity-80">{[item.owner, item.article_slug].filter(Boolean).join(" · ") || "No owner/slug"}</p>{item.next_step && <p className="mt-2 text-sm opacity-80">Next: {item.next_step}</p>}<div className="mt-2 flex flex-wrap gap-2 text-xs font-bold opacity-75">{item.publish_today && <span>publish today</span>}{item.homepage_candidate && <span>homepage candidate</span>}</div><StatusButtons table="newsroom_queue_items" id={item.id} values={["needs_attention", "editing", "ready", "published", "done"]} /></article>) : <Empty label="No newsroom queue items yet." />}</div>
        <form action={createQueueItem} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add queue item</h3><label>Title<input name="title" required placeholder="Story, homepage task, or publishing check" /></label><div className="grid gap-3 md:grid-cols-4"><label>Area<input name="queue_area" defaultValue="publishing" /></label><label>Owner<input name="owner" placeholder="Admin / Editor" /></label><label>Priority<select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label><label>Status<select name="status" defaultValue="needs_attention"><option>needs_attention</option><option>editing</option><option>ready</option><option>published</option><option>done</option></select></label></div><label>Article slug<input name="article_slug" /></label><label>Next step<textarea name="next_step" rows={2} /></label><div className="flex flex-wrap gap-4 text-sm font-bold"><label className="flex items-center gap-2"><input name="publish_today" type="checkbox" /> Publish today</label><label className="flex items-center gap-2"><input name="homepage_candidate" type="checkbox" /> Homepage candidate</label></div><button className="hgn-btn-primary">Save queue item</button></form></div>

      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Homepage priority</h2><p className="mt-1 text-sm text-slate-600">The front page should always answer: what matters most right now?</p><div className="mt-4 grid gap-3">{snapshot.homepage.length ? snapshot.homepage.map((slot) => <article key={slot.id} className={`rounded-xl border p-4 ${newsroomToneClasses(newsroomTone(slot.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">Slot {slot.slot_order} · {slot.status}</div><h3 className="mt-1 font-black">{slot.slot_name}</h3><p className="mt-1 text-sm opacity-80">{[slot.story_title, slot.article_slug].filter(Boolean).join(" · ") || "Not filled yet"}</p>{slot.notes && <p className="mt-2 text-sm opacity-80">{slot.notes}</p>}<StatusButtons table="newsroom_homepage_controls" id={slot.id} values={["planned", "filled", "needs_update", "done"]} /></article>) : <Empty label="No homepage slots yet." />}</div><form action={createHomepageSlot} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add homepage slot</h3><div className="grid gap-3 md:grid-cols-3"><label>Slot<input name="slot_name" required /></label><label>Order<input name="slot_order" type="number" defaultValue="1" /></label><label>Status<select name="status" defaultValue="planned"><option>planned</option><option>filled</option><option>needs_update</option><option>done</option></select></label></div><label>Story title<input name="story_title" /></label><label>Article slug<input name="article_slug" /></label><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save homepage slot</button></form></div>
    </section>

    <section className="mt-8 hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Sticky newsroom notes</h2><p className="mt-1 text-sm text-slate-600">Small reminders for the two of you. Keep these practical.</p><div className="mt-4 grid gap-3 md:grid-cols-2">{snapshot.notes.length ? snapshot.notes.map((note) => <article key={note.id} className={`rounded-xl border p-4 ${newsroomToneClasses(newsroomTone(note.status))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{note.note_type} · {note.status}</div><h3 className="mt-1 font-black">{note.note_title}</h3>{note.note_body && <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{note.note_body}</p>}<StatusButtons table="newsroom_notes" id={note.id} values={["open", "doing", "closed"]} /></article>) : <Empty label="No notes yet." />}</div><form action={createNote} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add note</h3><div className="grid gap-3 md:grid-cols-4"><label>Title<input name="note_title" required /></label><label>Type<input name="note_type" defaultValue="sticky" /></label><label>Owner<input name="owner" placeholder="HGN team" /></label><label>Status<select name="status" defaultValue="open"><option>open</option><option>doing</option><option>closed</option></select></label></div><label>Note<textarea name="note_body" rows={3} /></label><label className="flex items-center gap-2 text-sm font-bold"><input name="pinned" type="checkbox" defaultChecked /> Pin note</label><button className="hgn-btn-primary">Save note</button></form></section>
  </main>;
}
