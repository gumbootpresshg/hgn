import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { focusToneClasses, getFocusBoardSnapshot, toneForFocusItem } from "@/lib/focus-board";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addFocusItem(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await supabase.from("focus_board_items").insert({
    title,
    focus_area: String(formData.get("focus_area") || "publishing"),
    item_status: String(formData.get("item_status") || "open"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    priority: Number(formData.get("priority") || 3),
    notes: String(formData.get("notes") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateFocusStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  await supabase
    .from("focus_board_items")
    .update({ item_status: String(formData.get("item_status") || "open"), updated_at: new Date().toISOString() })
    .eq("id", id);
}

function FocusCard({ item }: { item: Row }) {
  const tone = toneForFocusItem(item);

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${focusToneClasses(tone)}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{item.focus_area}</span>
        <span>·</span>
        <span>Priority {item.priority}</span>
        <span>·</span>
        <span>{item.item_status}</span>
      </div>
      <h3 className="mt-2 text-xl font-black">{item.title}</h3>
      <p className="mt-2 text-sm font-bold opacity-80">Owner: {item.owner}</p>
      {item.notes ? <p className="mt-3 text-sm leading-6 opacity-80">{item.notes}</p> : null}
      <form action={updateFocusStatus} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="id" value={item.id} />
        {["open", "waiting", "ready", "blocked", "done", "dropped"].map((status) => (
          <button key={status} name="item_status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
            {status}
          </button>
        ))}
      </form>
    </article>
  );
}

export default async function FocusBoardPage() {
  const snapshot = await getFocusBoardSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";
  const stats = [
    ["Focus score", `${snapshot.score}%`, "How clear today feels", scoreTone],
    ["Open", snapshot.open.length, "Still active", snapshot.open.length > 5 ? "warn" : "good"],
    ["Top priority", snapshot.topPriority.length, "Important items", snapshot.topPriority.length ? "blue" : "warn"],
    ["Blockers", snapshot.blockers.length, "Needs attention", snapshot.blockers.length ? "bad" : "good"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v113 Focus Board</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Focus Board</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A small daily board for the admin/editor beta. Pick what matters, avoid dashboard hopping and keep the homepage and publishing priorities clear.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/today-board" className="hgn-btn-dark">Today Board</Link>
          <Link href="/admin/core" className="hgn-btn-dark">Core</Link>
          <Link href="/focus-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${focusToneClasses(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <h2 className="text-2xl font-black text-hgnNavy">Today&apos;s focus</h2>
          {snapshot.items.length ? (
            snapshot.items.map((item) => <FocusCard key={item.id} item={item} />)
          ) : (
            <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No focus items yet.</div>
          )}
        </div>

        <div className="grid gap-6">
          <form action={addFocusItem} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add focus item</h2>
            <input name="title" placeholder="What actually matters today?" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="focus_area" className="rounded-xl border px-4 py-3">
                <option value="lead_story">Lead story</option>
                <option value="homepage">Homepage</option>
                <option value="publishing">Publishing</option>
                <option value="blocker">Blocker</option>
                <option value="handoff">Handoff</option>
              </select>
              <select name="item_status" className="rounded-xl border px-4 py-3">
                <option value="open">Open</option>
                <option value="waiting">Waiting</option>
                <option value="ready">Ready</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <select name="priority" className="rounded-xl border px-4 py-3">
              <option value="1">Priority 1</option>
              <option value="2">Priority 2</option>
              <option value="3">Priority 3</option>
              <option value="4">Priority 4</option>
            </select>
            <textarea name="notes" placeholder="Short admin/editor note" className="min-h-28 rounded-xl border px-4 py-3" />
            <button className="hgn-btn-primary">Add to focus board</button>
          </form>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Focus checks</h2>
            <div className="mt-4 grid gap-3">
              {snapshot.checks.map((check) => (
                <div key={check.id} className="rounded-xl border bg-slate-50 p-4">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500">{check.check_area}</div>
                  <h3 className="mt-1 font-black text-hgnNavy">{check.title}</h3>
                  {check.helper ? <p className="mt-2 text-sm text-slate-700">{check.helper}</p> : null}
                  <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-500">{check.is_ready ? "Ready" : "Open"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
