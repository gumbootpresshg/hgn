import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getStoryboardSnapshot, storyboardTone, storyboardToneClasses } from "@/lib/storyboard";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addStory(formData: FormData) {
  "use server";
  const story_title = String(formData.get("story_title") || "").trim();
  if (!story_title) return;
  await supabase.from("newsroom_storyboard_items").insert({
    story_title,
    story_slug: String(formData.get("story_slug") || "").trim() || null,
    story_type: String(formData.get("story_type") || "article"),
    workflow_state: String(formData.get("workflow_state") || "idea"),
    priority_level: String(formData.get("priority_level") || "normal"),
    assigned_to: String(formData.get("assigned_to") || "Admin / Editor").trim() || "Admin / Editor",
    needs_photo: formData.get("needs_photo") === "on",
    needs_source_check: formData.get("needs_source_check") === "on",
    target_window: String(formData.get("target_window") || "").trim() || null,
    homepage_slot: String(formData.get("homepage_slot") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function addNote(formData: FormData) {
  "use server";
  const note_title = String(formData.get("note_title") || "").trim();
  if (!note_title) return;
  await supabase.from("newsroom_storyboard_notes").insert({
    note_title,
    note_body: String(formData.get("note_body") || "").trim() || null,
    note_type: String(formData.get("note_type") || "planning"),
    status: String(formData.get("status") || "open"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
  });
}

async function updateStory(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const workflow_state = String(formData.get("workflow_state") || "");
  if (!id || !workflow_state) return;
  const patch: Row = { workflow_state, updated_at: new Date().toISOString() };
  if (workflow_state === "published") patch.published_at = new Date().toISOString();
  await supabase.from("newsroom_storyboard_items").update(patch).eq("id", id);
}

function StateButtons({ id }: { id: string }) {
  const states = ["idea", "drafting", "waiting", "ready", "blocked", "published", "dropped"];
  return <form action={updateStory} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="id" value={id} />{states.map((state) => <button key={state} name="workflow_state" value={state} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">{state}</button>)}</form>;
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm text-slate-600">{label}</div>;
}

export default async function StoryboardAdminPage() {
  const snapshot = await getStoryboardSnapshot();
  const scoreTone = snapshot.score >= 80 ? "good" : snapshot.score >= 55 ? "warn" : "bad";
  const stats = [
    ["Storyboard ready", `${snapshot.score}%`, "Planning board health", scoreTone],
    ["Ready", snapshot.readyItems.length, "Stories that can move next", snapshot.readyItems.length ? "good" : "warn"],
    ["Waiting", snapshot.waitingItems.length, "Photo, source or blocker checks", snapshot.waitingItems.length ? "bad" : "good"],
    ["Active", snapshot.activeItems.length, "Keep this low for two-person beta", snapshot.activeItems.length > 8 ? "warn" : "good"],
  ] as const;

  return <main className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v97 Admin/Editor Planning</p>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Storyboard</h1>
        <p className="mt-3 max-w-3xl text-slate-700">A small planning board for the two-person HGN beta. Track what is next, what is ready and what is blocked without turning publishing into project management.</p>
      </div>
      <div className="flex flex-wrap gap-2"><Link href="/admin/newsroom" className="hgn-btn-dark">Newsroom</Link><Link href="/admin/fast-publish" className="hgn-btn-dark">Fast Publish</Link><Link href="/storyboard-status" className="hgn-btn-primary">Status</Link></div>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, helper, tone]) => <div key={label} className={`rounded-2xl border p-5 shadow-sm ${storyboardToneClasses(String(tone))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div><div className="mt-2 text-4xl font-black">{value}</div><p className="mt-2 text-sm opacity-80">{helper}</p></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Story board</h2><p className="mt-1 text-sm text-slate-600">Keep this tight. If it is not likely to publish soon, it probably does not belong here yet.</p><div className="mt-4 grid gap-3">{snapshot.items.length ? snapshot.items.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${storyboardToneClasses(storyboardTone(item.workflow_state, item.priority_level, item.needs_photo, item.needs_source_check))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">#{item.sort_order} · {item.story_type} · {item.workflow_state} · {item.priority_level}</div><h3 className="mt-1 text-lg font-black">{item.story_title}</h3><div className="mt-2 flex flex-wrap gap-2 text-xs font-black">{item.assigned_to && <span className="rounded-full bg-white/70 px-2 py-1">{item.assigned_to}</span>}{item.target_window && <span className="rounded-full bg-white/70 px-2 py-1">{item.target_window}</span>}{item.homepage_slot && <span className="rounded-full bg-white/70 px-2 py-1">Slot: {item.homepage_slot}</span>}{item.needs_photo && <span className="rounded-full bg-white/70 px-2 py-1">Needs photo</span>}{item.needs_source_check && <span className="rounded-full bg-white/70 px-2 py-1">Needs source check</span>}</div>{item.notes && <p className="mt-2 text-sm opacity-80">{item.notes}</p>}<StateButtons id={item.id} /></article>) : <Empty label="No storyboard items yet." />}</div>
        <form action={addStory} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add story</h3><label>Story title<input name="story_title" required /></label><label>Slug or article reference<input name="story_slug" placeholder="optional" /></label><div className="grid gap-3 md:grid-cols-4"><label>Order<input name="sort_order" type="number" defaultValue="100" /></label><label>Type<select name="story_type" defaultValue="article"><option>article</option><option>photo</option><option>planning</option><option>live</option><option>notice</option></select></label><label>State<select name="workflow_state" defaultValue="idea"><option>idea</option><option>drafting</option><option>waiting</option><option>ready</option><option>blocked</option></select></label><label>Priority<select name="priority_level" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label></div><div className="grid gap-3 md:grid-cols-3"><label>Assigned to<input name="assigned_to" defaultValue="Admin / Editor" /></label><label>Target window<input name="target_window" placeholder="Today, tomorrow, this week" /></label><label>Homepage slot<input name="homepage_slot" placeholder="Hero, Latest, Community" /></label></div><div className="flex flex-wrap gap-4 text-sm font-bold"><label className="flex items-center gap-2"><input name="needs_photo" type="checkbox" /> Needs photo</label><label className="flex items-center gap-2"><input name="needs_source_check" type="checkbox" /> Needs source check</label></div><label>Notes<textarea name="notes" rows={3} /></label><button className="hgn-btn-primary">Save story</button></form>
      </div>

      <div className="grid gap-6"><div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Planning notes</h2><div className="mt-4 grid gap-3">{snapshot.notes.length ? snapshot.notes.map((note) => <article key={note.id} className="rounded-xl border bg-white p-4"><div className="text-xs font-black uppercase tracking-wide text-slate-500">{note.note_type} · {note.status} · {note.owner || "Admin / Editor"}</div><h3 className="mt-1 font-black text-hgnNavy">{note.note_title}</h3>{note.note_body && <p className="mt-2 text-sm text-slate-700">{note.note_body}</p>}</article>) : <Empty label="No planning notes yet." />}</div><form action={addNote} className="mt-6 grid gap-3 rounded-2xl border bg-slate-50 p-4"><h3 className="font-black text-hgnNavy">Add note</h3><label>Title<input name="note_title" required /></label><label>Note<textarea name="note_body" rows={3} /></label><div className="grid gap-3 md:grid-cols-2"><label>Type<input name="note_type" defaultValue="planning" /></label><label>Owner<input name="owner" defaultValue="Admin / Editor" /></label></div><button className="hgn-btn-primary">Save note</button></form></div>
      <div className="rounded-2xl border bg-hgnNavy p-6 text-white"><h2 className="text-2xl font-black">Two-person rule</h2><p className="mt-2 text-sm text-white/80">The board is successful when both people can understand what goes live next in under a minute. Archive or drop anything that is creating noise.</p></div></div>
    </section>
  </main>;
}
