import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { coreToneClasses, getBetaReadyCoreSnapshot } from "@/lib/beta-ready-core";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addCoreTask(formData: FormData) {
  "use server";

  const title = String(formData.get("task_title") || "").trim();
  if (!title) return;

  await supabase.from("beta_ready_core_tasks").insert({
    task_title: title,
    task_type: String(formData.get("task_type") || "daily"),
    status: String(formData.get("status") || "open"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    is_blocking: formData.get("is_blocking") === "on",
    sort_order: Number(formData.get("sort_order") || 100),
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateCoreTask(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status) return;

  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (status === "done" || status === "cleared") patch.completed_at = new Date().toISOString();
  await supabase.from("beta_ready_core_tasks").update(patch).eq("id", id);
}

function toneForTask(task: Row) {
  const status = String(task.status || "").toLowerCase();
  if (task.is_blocking || status === "blocked" || status === "needs_fix") return "bad";
  if (status === "waiting") return "warn";
  if (status === "done" || status === "cleared") return "good";
  return "neutral";
}

function StatusButtons({ id }: { id: string }) {
  return (
    <form action={updateCoreTask} className="mt-3 flex flex-wrap gap-2">
      <input type="hidden" name="id" value={id} />
      {["open", "waiting", "needs_fix", "blocked", "cleared", "done"].map((status) => (
        <button key={status} name="status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
          {status}
        </button>
      ))}
    </form>
  );
}

export default async function BetaReadyCorePage() {
  const snapshot = await getBetaReadyCoreSnapshot();
  const scoreTone = snapshot.score >= 80 ? "good" : snapshot.score >= 55 ? "warn" : "bad";
  const stats = [
    ["Core ready", `${snapshot.score}%`, "Compact daily readiness", scoreTone],
    ["Open tasks", snapshot.openCoreTasks.length, "Keep this list short", snapshot.openCoreTasks.length > 8 ? "warn" : "good"],
    ["Blockers", snapshot.blockers.length, "Fix before publishing", snapshot.blockers.length ? "bad" : "good"],
    ["Homepage slots", snapshot.homepageSlots.length, "Active homepage controls", "neutral"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v100 Admin/Editor Core</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Beta Ready Core</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A compact daily command page for the two-person beta: publish checks, homepage focus, live items and handoff notes in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/today-board" className="hgn-btn-dark">Today Board</Link>
          <Link href="/admin/publish-sweep" className="hgn-btn-dark">Publish Sweep</Link>
          <Link href="/admin/homepage-control" className="hgn-btn-dark">Homepage</Link>
          <Link href="/core-status" className="hgn-btn-primary">Public Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${coreToneClasses(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-hgnNavy">Needs attention</h2>
            <Link href="/admin/newsroom" className="text-sm font-black text-hgnBlue">Newsroom</Link>
          </div>
          {snapshot.coreTasks.length ? (
            snapshot.coreTasks.map((task) => (
              <article key={task.id} className={`rounded-2xl border p-5 shadow-sm ${coreToneClasses(toneForTask(task))}`}>
                <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
                  <span>{task.task_type}</span>
                  <span>·</span>
                  <span>{task.owner || "Admin / Editor"}</span>
                  <span>·</span>
                  <span>{task.status}</span>
                </div>
                <h3 className="mt-2 text-xl font-black">{task.task_title}</h3>
                {task.notes ? <p className="mt-2 text-sm opacity-80">{task.notes}</p> : null}
                {task.is_blocking ? <p className="mt-2 text-sm font-black text-rose-700">Blocking until cleared.</p> : null}
                <StatusButtons id={task.id} />
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No core tasks yet.</div>
          )}
        </div>

        <div className="grid gap-6">
          <form action={addCoreTask} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add core task</h2>
            <input name="task_title" placeholder="Task title" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="task_type" className="rounded-xl border px-4 py-3">
                <option value="daily">Daily</option>
                <option value="publish">Publish</option>
                <option value="homepage">Homepage</option>
                <option value="live">Live</option>
                <option value="handoff">Handoff</option>
              </select>
              <select name="owner" className="rounded-xl border px-4 py-3">
                <option>Admin / Editor</option>
                <option>Admin</option>
                <option>Editor</option>
              </select>
            </div>
            <textarea name="notes" placeholder="Notes" className="min-h-24 rounded-xl border px-4 py-3" />
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <input name="is_blocking" type="checkbox" /> Blocking item
            </label>
            <button className="hgn-btn-primary">Add task</button>
          </form>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Quick links</h2>
            <div className="mt-4 grid gap-2">
              <Link href="/admin/fast-publish" className="rounded-xl border p-3 font-bold hover:border-hgnBlue">Fast Publish</Link>
              <Link href="/admin/publish-brief" className="rounded-xl border p-3 font-bold hover:border-hgnBlue">Publish Brief</Link>
              <Link href="/admin/live-desk" className="rounded-xl border p-3 font-bold hover:border-hgnBlue">Live Desk</Link>
              <Link href="/admin/handoff" className="rounded-xl border p-3 font-bold hover:border-hgnBlue">Handoff</Link>
              <Link href="/admin/trim-desk" className="rounded-xl border p-3 font-bold hover:border-hgnBlue">Trim Desk</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
