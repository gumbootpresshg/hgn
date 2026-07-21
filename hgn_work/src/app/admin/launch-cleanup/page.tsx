import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getLaunchCleanupSnapshot, launchCleanupTone } from "@/lib/launch-cleanup";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addCleanupItem(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await supabase.from("launch_cleanup_items").insert({
    title,
    item_area: String(formData.get("item_area") || "admin"),
    item_status: String(formData.get("item_status") || "today"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    cleanup_note: String(formData.get("cleanup_note") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateCleanupItem(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  await supabase
    .from("launch_cleanup_items")
    .update({ item_status: String(formData.get("item_status") || "today"), updated_at: new Date().toISOString() })
    .eq("id", id);
}

function CleanupCard({ item }: { item: Row }) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${launchCleanupTone(item.item_status)}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{item.item_area}</span>
        <span>{item.item_status}</span>
      </div>
      <h3 className="mt-2 text-xl font-black">{item.title}</h3>
      <p className="mt-2 text-sm font-bold opacity-80">Owner: {item.owner}</p>
      {item.cleanup_note ? <p className="mt-3 text-sm leading-6 opacity-80">{item.cleanup_note}</p> : null}
      <form action={updateCleanupItem} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="id" value={item.id} />
        {["today", "review", "blocked", "done", "parked"].map((status) => (
          <button key={status} name="item_status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
            {status}
          </button>
        ))}
      </form>
    </article>
  );
}

export default async function LaunchCleanupPage() {
  const snapshot = await getLaunchCleanupSnapshot();
  const stats = [
    ["Cleanup score", `${snapshot.score}%`, "How close the admin side feels to launch-clean"],
    ["Active cleanup", snapshot.activeItems.length, "Things to simplify now"],
    ["Blocked", snapshot.blockedItems.length, "Fix before adding anything new"],
    ["Parked/hidden", snapshot.hiddenRoutes.length, "Good consolidation signal"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v121 Launch Cleanup</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Launch Cleanup</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A consolidation pass for the two-person admin/editor beta. Use this to cut clutter, park extra desks, and keep the launch path clean.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/newsroom-hub" className="hgn-btn-dark">Newsroom Hub</Link>
          <Link href="/admin/core-workflow" className="hgn-btn-dark">Core Workflow</Link>
          <Link href="/launch-cleanup-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper]) => (
          <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</div>
            <div className="mt-2 text-4xl font-black text-hgnNavy">{value}</div>
            <p className="mt-2 text-sm text-slate-600">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <h2 className="text-2xl font-black text-hgnNavy">Cleanup queue</h2>
          {snapshot.items.length ? (
            snapshot.items.map((item) => <CleanupCard key={item.id} item={item} />)
          ) : (
            <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No cleanup items yet.</div>
          )}
        </div>

        <aside className="grid gap-6">
          <form action={addCleanupItem} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add cleanup item</h2>
            <input name="title" placeholder="Cleanup item" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="item_area" className="rounded-xl border px-4 py-3">
                <option value="admin">Admin</option>
                <option value="publishing">Publishing</option>
                <option value="homepage">Homepage</option>
                <option value="media">Media</option>
                <option value="navigation">Navigation</option>
                <option value="public-site">Public site</option>
              </select>
              <select name="item_status" className="rounded-xl border px-4 py-3">
                <option value="today">Today</option>
                <option value="review">Review</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
                <option value="parked">Parked</option>
              </select>
            </div>
            <input name="owner" placeholder="Admin / Editor" className="rounded-xl border px-4 py-3" />
            <textarea name="cleanup_note" placeholder="What should be removed, merged, renamed, or simplified?" className="min-h-28 rounded-xl border px-4 py-3" />
            <button type="submit" className="hgn-btn-primary">Add item</button>
          </form>

          <section className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Route cleanup</h2>
            <div className="mt-4 grid gap-3">
              {snapshot.routes.map((route) => (
                <Link key={route.id} href={route.href || "/admin"} className={`rounded-xl border p-4 transition hover:border-hgnBlue ${launchCleanupTone(route.route_status)}`}>
                  <div className="text-xs font-black uppercase tracking-widest opacity-70">{route.route_status}</div>
                  <h3 className="mt-1 font-black">{route.title}</h3>
                  {route.reason ? <p className="mt-1 text-sm opacity-80">{route.reason}</p> : null}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
