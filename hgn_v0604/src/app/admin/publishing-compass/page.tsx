import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getPublishingCompassSnapshot, publishingCompassToneClasses, toneForCompassItem } from "@/lib/publishing-compass";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addCompassItem(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await supabase.from("publishing_compass_items").insert({
    title,
    compass_area: String(formData.get("compass_area") || "today"),
    item_status: String(formData.get("item_status") || "open"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    target_window: String(formData.get("target_window") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateCompassItem(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  const status = String(formData.get("item_status") || "open");
  const isDone = status === "done";

  await supabase
    .from("publishing_compass_items")
    .update({ item_status: status, is_done: isDone, completed_at: isDone ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
    .eq("id", id);
}

function CompassCard({ item }: { item: Row }) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${publishingCompassToneClasses(toneForCompassItem(item))}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{item.compass_area}</span>
        <span>·</span>
        <span>{item.item_status}</span>
        <span>·</span>
        <span>{item.priority}</span>
        {item.target_window ? <span>· {item.target_window}</span> : null}
      </div>
      <h3 className="mt-2 text-xl font-black">{item.title}</h3>
      {item.notes ? <p className="mt-3 text-sm leading-6 opacity-80">{item.notes}</p> : null}
      <form action={updateCompassItem} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="id" value={item.id} />
        {["open", "needs review", "waiting", "blocked", "done"].map((status) => (
          <button key={status} name="item_status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
            {status}
          </button>
        ))}
      </form>
    </article>
  );
}

export default async function PublishingCompassPage() {
  const snapshot = await getPublishingCompassSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";
  const stats = [
    ["Direction ready", `${snapshot.score}%`, "Daily focus clarity", scoreTone],
    ["Active", snapshot.active.length, "Keep the list short", snapshot.active.length > 5 ? "warn" : "good"],
    ["High priority", snapshot.highPriority.length, "Too many creates noise", snapshot.highPriority.length > 2 ? "warn" : "good"],
    ["Blocked", snapshot.blocked.length, "Fix before publishing", snapshot.blocked.length ? "bad" : "good"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v106 Publishing Compass</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Publishing Compass</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A compact direction board for the two-person beta workflow. Use it to decide what matters today before opening every other admin desk.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/core" className="hgn-btn-dark">Core</Link>
          <Link href="/admin/today-board" className="hgn-btn-dark">Today Board</Link>
          <Link href="/publishing-compass-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${publishingCompassToneClasses(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <h2 className="text-2xl font-black text-hgnNavy">Daily direction</h2>
          {snapshot.items.length ? (
            snapshot.items.map((item) => <CompassCard key={item.id} item={item} />)
          ) : (
            <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No compass items yet.</div>
          )}
        </div>

        <div className="grid gap-6">
          <form action={addCompassItem} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add direction item</h2>
            <input name="title" placeholder="What needs direction today?" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="compass_area" className="rounded-xl border px-4 py-3">
                <option value="today">Today</option>
                <option value="homepage">Homepage</option>
                <option value="publishing">Publishing</option>
                <option value="cleanup">Cleanup</option>
                <option value="handoff">Handoff</option>
              </select>
              <select name="priority" className="rounded-xl border px-4 py-3">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <input name="target_window" placeholder="Target window, for example Morning" className="rounded-xl border px-4 py-3" />
            <textarea name="notes" placeholder="Short note" className="min-h-28 rounded-xl border px-4 py-3" />
            <button className="hgn-btn-primary">Add item</button>
          </form>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Compass checks</h2>
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
