import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getShiftCenterSnapshot, shiftToneClasses, toneForShiftItem } from "@/lib/shift-center";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addShiftItem(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await supabase.from("shift_center_items").insert({
    title,
    item_type: String(formData.get("item_type") || "task"),
    shift_status: String(formData.get("shift_status") || "open"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    due_label: String(formData.get("due_label") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateShiftItem(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  const status = String(formData.get("shift_status") || "open");
  const isDone = status === "done";

  await supabase
    .from("shift_center_items")
    .update({
      shift_status: status,
      is_done: isDone,
      completed_at: isDone ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

function ShiftCard({ item }: { item: Row }) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${shiftToneClasses(toneForShiftItem(item))}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{item.item_type}</span>
        <span>·</span>
        <span>{item.shift_status}</span>
        <span>·</span>
        <span>{item.priority}</span>
        {item.due_label ? <span>· {item.due_label}</span> : null}
      </div>
      <h3 className="mt-2 text-xl font-black">{item.title}</h3>
      {item.notes ? <p className="mt-3 text-sm leading-6 opacity-80">{item.notes}</p> : null}
      <form action={updateShiftItem} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="id" value={item.id} />
        {["open", "watching", "waiting", "blocked", "done"].map((status) => (
          <button key={status} name="shift_status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
            {status}
          </button>
        ))}
      </form>
    </article>
  );
}

export default async function ShiftCenterPage() {
  const snapshot = await getShiftCenterSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";
  const stats = [
    ["Shift ready", `${snapshot.score}%`, "Simple daily signal", scoreTone],
    ["Active", snapshot.active.length, "Keep the list short", snapshot.active.length > 6 ? "warn" : "good"],
    ["Blocked", snapshot.blocked.length, "Needs attention", snapshot.blocked.length ? "bad" : "good"],
    ["Watching", snapshot.watching.length, "Live or urgent items", snapshot.watching.length ? "blue" : "neutral"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v104 Shift Center</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Shift Center</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A simple admin/editor handoff board for the two-person beta. Keep the day clear: what is next, what is blocked, and what needs to stay visible.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/today-board" className="hgn-btn-dark">Today Board</Link>
          <Link href="/admin/edit-queue" className="hgn-btn-dark">Edit Queue</Link>
          <Link href="/shift-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${shiftToneClasses(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <h2 className="text-2xl font-black text-hgnNavy">Current shift</h2>
          {snapshot.items.length ? snapshot.items.map((item) => <ShiftCard key={item.id} item={item} />) : <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No shift items yet.</div>}
        </div>

        <div className="grid gap-6">
          <form action={addShiftItem} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add shift item</h2>
            <input name="title" placeholder="What needs attention?" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="item_type" className="rounded-xl border px-4 py-3">
                <option value="publishing">Publishing</option>
                <option value="homepage">Homepage</option>
                <option value="live">Live</option>
                <option value="handoff">Handoff</option>
                <option value="task">Task</option>
              </select>
              <select name="priority" className="rounded-xl border px-4 py-3">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <input name="due_label" placeholder="Today, end of shift, this morning" className="rounded-xl border px-4 py-3" />
            <textarea name="notes" placeholder="Short note" className="min-h-28 rounded-xl border px-4 py-3" />
            <button className="hgn-btn-primary">Add item</button>
          </form>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Pinned notes</h2>
            <div className="mt-4 grid gap-3">
              {snapshot.notes.map((note) => (
                <div key={note.id} className="rounded-xl border bg-slate-50 p-4">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500">{note.note_type}</div>
                  <h3 className="mt-1 font-black text-hgnNavy">{note.note_title}</h3>
                  {note.note_body ? <p className="mt-2 text-sm text-slate-700">{note.note_body}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
