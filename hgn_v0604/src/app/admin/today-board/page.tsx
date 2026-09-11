import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getTodayBoardSnapshot, todayBoardToneClasses, toneForTodayItem } from "@/lib/today-board";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addTodayItem(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await supabase.from("today_board_items").insert({
    title,
    item_type: String(formData.get("item_type") || "story"),
    priority: String(formData.get("priority") || "normal"),
    status: String(formData.get("status") || "open"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    target_time: String(formData.get("target_time") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateTodayItem(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status) return;

  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (status === "done" || status === "published") patch.completed_at = new Date().toISOString();
  await supabase.from("today_board_items").update(patch).eq("id", id);
}

function StatusButtons({ id }: { id: string }) {
  const statuses = ["open", "working", "waiting", "blocked", "ready", "published", "done"];
  return (
    <form action={updateTodayItem} className="mt-4 flex flex-wrap gap-2">
      <input type="hidden" name="id" value={id} />
      {statuses.map((status) => (
        <button key={status} name="status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
          {status}
        </button>
      ))}
    </form>
  );
}

function ItemCard({ item }: { item: Row }) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${todayBoardToneClasses(toneForTodayItem(item))}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{item.item_type}</span>
        <span>·</span>
        <span>{item.priority}</span>
        <span>·</span>
        <span>{item.owner || "Admin / Editor"}</span>
        {item.target_time ? <span>· {item.target_time}</span> : null}
      </div>
      <h3 className="mt-2 text-xl font-black">{item.title}</h3>
      {item.notes ? <p className="mt-2 text-sm leading-6 opacity-80">{item.notes}</p> : null}
      <p className="mt-3 text-sm font-black uppercase tracking-widest opacity-70">Status: {item.status}</p>
      <StatusButtons id={item.id} />
    </article>
  );
}

export default async function TodayBoardPage() {
  const snapshot = await getTodayBoardSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";
  const stats = [
    ["Today ready", `${snapshot.score}%`, "Simple daily operating signal", scoreTone],
    ["Open", snapshot.openItems.length, "Keep today small and finishable", snapshot.openItems.length > 8 ? "warn" : "good"],
    ["Blocked", snapshot.blockedItems.length, "Clear before publishing", snapshot.blockedItems.length ? "bad" : "good"],
    ["Done", snapshot.doneItems.length, "Progress today", "blue"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v101 Daily Flow</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Today Board</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A small daily board for the two-person admin/editor beta. Use it for the lead story, homepage focus, blockers and handoff notes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/core" className="hgn-btn-dark">Core</Link>
          <Link href="/admin/fast-publish" className="hgn-btn-dark">Fast Publish</Link>
          <Link href="/today-board-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${todayBoardToneClasses(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-hgnNavy">Today only</h2>
            <span className="text-sm font-bold text-slate-500">Small board, fewer clicks</span>
          </div>
          {snapshot.items.length ? snapshot.items.map((item) => <ItemCard key={item.id} item={item} />) : <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No items yet. Add only what matters today.</div>}
        </div>

        <div className="grid gap-6">
          <form action={addTodayItem} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add today item</h2>
            <input name="title" placeholder="Example: Lead story ready for final edit" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="item_type" className="rounded-xl border px-4 py-3">
                <option value="lead">Lead story</option>
                <option value="story">Story</option>
                <option value="homepage">Homepage</option>
                <option value="photo">Photo/media</option>
                <option value="handoff">Handoff</option>
              </select>
              <select name="priority" className="rounded-xl border px-4 py-3">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <select name="owner" className="rounded-xl border px-4 py-3">
                <option>Admin / Editor</option>
                <option>Admin</option>
                <option>Editor</option>
              </select>
              <input name="target_time" placeholder="Target time, optional" className="rounded-xl border px-4 py-3" />
            </div>
            <textarea name="notes" placeholder="Short note or blocker" className="min-h-24 rounded-xl border px-4 py-3" />
            <button className="hgn-btn-primary">Add to today</button>
          </form>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Best use</h2>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
              <p><strong>Morning:</strong> add the lead story, homepage focus and any blocker.</p>
              <p><strong>Before publish:</strong> move items to ready, then use Publish Sweep.</p>
              <p><strong>End of day:</strong> mark done and leave one handoff note for tomorrow.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
