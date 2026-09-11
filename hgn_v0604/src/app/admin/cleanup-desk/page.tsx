import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { cleanupToneClasses, getCleanupDeskSnapshot, toneForCleanupItem } from "@/lib/cleanup-desk";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addCleanupItem(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await supabase.from("cleanup_desk_items").insert({
    title,
    cleanup_area: String(formData.get("cleanup_area") || "publishing"),
    cleanup_status: String(formData.get("cleanup_status") || "open"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    notes: String(formData.get("notes") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateCleanupItem(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  const status = String(formData.get("cleanup_status") || "open");
  const isDone = status === "done";

  await supabase
    .from("cleanup_desk_items")
    .update({ cleanup_status: status, is_done: isDone, completed_at: isDone ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
    .eq("id", id);
}

function CleanupCard({ item }: { item: Row }) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${cleanupToneClasses(toneForCleanupItem(item))}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{item.cleanup_area}</span>
        <span>·</span>
        <span>{item.cleanup_status}</span>
        <span>·</span>
        <span>{item.priority}</span>
      </div>
      <h3 className="mt-2 text-xl font-black">{item.title}</h3>
      {item.notes ? <p className="mt-3 text-sm leading-6 opacity-80">{item.notes}</p> : null}
      <form action={updateCleanupItem} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="id" value={item.id} />
        {["open", "needs review", "waiting", "blocked", "done"].map((status) => (
          <button key={status} name="cleanup_status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
            {status}
          </button>
        ))}
      </form>
    </article>
  );
}

export default async function CleanupDeskPage() {
  const snapshot = await getCleanupDeskSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";
  const stats = [
    ["Cleanup ready", `${snapshot.score}%`, "Less clutter before publishing", scoreTone],
    ["Active", snapshot.active.length, "Keep this short", snapshot.active.length > 6 ? "warn" : "good"],
    ["Review", snapshot.review.length, "Needs a second look", snapshot.review.length ? "warn" : "good"],
    ["Blocked", snapshot.blocked.length, "Fix before launch", snapshot.blocked.length ? "bad" : "good"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v105 Cleanup Desk</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Cleanup Desk</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A small admin/editor cleanup board for beta work. Use it to park quick fixes, admin clutter, homepage polish, media cleanup, and pre-launch loose ends.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/core" className="hgn-btn-dark">Core</Link>
          <Link href="/admin/shift-center" className="hgn-btn-dark">Shift Center</Link>
          <Link href="/cleanup-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${cleanupToneClasses(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <h2 className="text-2xl font-black text-hgnNavy">Cleanup queue</h2>
          {snapshot.items.length ? snapshot.items.map((item) => <CleanupCard key={item.id} item={item} />) : <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No cleanup items yet.</div>}
        </div>

        <div className="grid gap-6">
          <form action={addCleanupItem} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add cleanup item</h2>
            <input name="title" placeholder="What needs cleaning up?" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="cleanup_area" className="rounded-xl border px-4 py-3">
                <option value="publishing">Publishing</option>
                <option value="homepage">Homepage</option>
                <option value="media">Media</option>
                <option value="admin">Admin</option>
                <option value="mobile">Mobile</option>
              </select>
              <select name="priority" className="rounded-xl border px-4 py-3">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <textarea name="notes" placeholder="Short note" className="min-h-28 rounded-xl border px-4 py-3" />
            <button className="hgn-btn-primary">Add item</button>
          </form>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Quick sweeps</h2>
            <div className="mt-4 grid gap-3">
              {snapshot.sweeps.map((sweep) => (
                <div key={sweep.id} className="rounded-xl border bg-slate-50 p-4">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500">{sweep.sweep_area}</div>
                  <h3 className="mt-1 font-black text-hgnNavy">{sweep.title}</h3>
                  {sweep.description ? <p className="mt-2 text-sm text-slate-700">{sweep.description}</p> : null}
                  <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-500">{sweep.is_complete ? "Complete" : "Open"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
