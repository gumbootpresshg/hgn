import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getTrimDeskSnapshot, trimToneClasses, toneForTrimItem } from "@/lib/trim-desk";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addTrimItem(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await supabase.from("trim_desk_items").insert({
    title,
    item_area: String(formData.get("item_area") || "admin"),
    trim_status: String(formData.get("trim_status") || "open"),
    priority: String(formData.get("priority") || "normal"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    target_path: String(formData.get("target_path") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateTrimItem(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  const status = String(formData.get("trim_status") || "open");
  const isDone = status === "done" || status === "dropped";

  await supabase
    .from("trim_desk_items")
    .update({
      trim_status: status,
      is_done: isDone,
      completed_at: isDone ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

function TrimCard({ item }: { item: Row }) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${trimToneClasses(toneForTrimItem(item))}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{item.item_area}</span>
        <span>·</span>
        <span>{item.trim_status}</span>
        <span>·</span>
        <span>{item.priority}</span>
      </div>
      <h3 className="mt-2 text-xl font-black">{item.title}</h3>
      {item.target_path ? <p className="mt-2 text-sm font-bold opacity-80">Path: {item.target_path}</p> : null}
      {item.notes ? <p className="mt-3 text-sm leading-6 opacity-80">{item.notes}</p> : null}
      <form action={updateTrimItem} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="id" value={item.id} />
        {["open", "active", "waiting", "blocked", "dropped", "done"].map((status) => (
          <button key={status} name="trim_status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
            {status}
          </button>
        ))}
      </form>
    </article>
  );
}

export default async function TrimDeskPage() {
  const snapshot = await getTrimDeskSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";
  const stats = [
    ["Trim score", `${snapshot.score}%`, "How simple the workflow feels", scoreTone],
    ["Open", snapshot.open.length, "Things to simplify", snapshot.open.length > 6 ? "warn" : "good"],
    ["Active", snapshot.active.length, "Currently being cleaned", snapshot.active.length ? "blue" : "neutral"],
    ["Blockers", snapshot.blockers.length, "Must not slow publishing", snapshot.blockers.length ? "bad" : "good"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v109 Trim Desk</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Trim Desk</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A small cleanup board for the two-person beta. Use it to trim clutter, duplicate flows and anything that slows daily publishing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/core" className="hgn-btn-dark">Core</Link>
          <Link href="/admin/newsflow-board" className="hgn-btn-dark">Newsflow</Link>
          <Link href="/trim-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${trimToneClasses(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <h2 className="text-2xl font-black text-hgnNavy">Simplify next</h2>
          {snapshot.items.length ? (
            snapshot.items.map((item) => <TrimCard key={item.id} item={item} />)
          ) : (
            <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No trim items yet.</div>
          )}
        </div>

        <div className="grid gap-6">
          <form action={addTrimItem} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add cleanup item</h2>
            <input name="title" placeholder="What feels noisy, duplicate or slow?" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="item_area" className="rounded-xl border px-4 py-3">
                <option value="admin">Admin</option>
                <option value="publishing">Publishing</option>
                <option value="homepage">Homepage</option>
                <option value="media">Media</option>
                <option value="ux">UX</option>
              </select>
              <select name="priority" className="rounded-xl border px-4 py-3">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <input name="target_path" placeholder="Optional path, like /admin/core" className="rounded-xl border px-4 py-3" />
            <textarea name="notes" placeholder="Short note" className="min-h-28 rounded-xl border px-4 py-3" />
            <button className="hgn-btn-primary">Add cleanup item</button>
          </form>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Simplicity checks</h2>
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
