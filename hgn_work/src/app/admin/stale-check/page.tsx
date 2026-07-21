import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getStaleCheckSnapshot, staleToneClasses, toneForStaleItem } from "@/lib/stale-check";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addStaleItem(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await supabase.from("stale_check_items").insert({
    title,
    item_area: String(formData.get("item_area") || "homepage"),
    item_status: String(formData.get("item_status") || "open"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    age_hours: Number(formData.get("age_hours") || 0),
    notes: String(formData.get("notes") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateStaleStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  await supabase
    .from("stale_check_items")
    .update({
      item_status: String(formData.get("item_status") || "open"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

function StaleCard({ item }: { item: Row }) {
  const tone = toneForStaleItem(item);

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${staleToneClasses(tone)}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{item.item_area}</span>
        <span>{item.item_status}</span>
        <span>{item.age_hours || 0}h old</span>
      </div>
      <h3 className="mt-2 text-xl font-black">{item.title}</h3>
      <p className="mt-2 text-sm font-bold opacity-80">Owner: {item.owner}</p>
      {item.notes ? <p className="mt-3 text-sm leading-6 opacity-80">{item.notes}</p> : null}
      <form action={updateStaleStatus} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="id" value={item.id} />
        {["open", "review", "fixed", "blocked", "dropped"].map((status) => (
          <button key={status} name="item_status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
            {status}
          </button>
        ))}
      </form>
    </article>
  );
}

export default async function StaleCheckPage() {
  const snapshot = await getStaleCheckSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";
  const stats = [
    ["Freshness score", `${snapshot.score}%`, "How current the public site feels", scoreTone],
    ["Active", snapshot.active.length, "Still needs a look", snapshot.active.length > 5 ? "warn" : "good"],
    ["Urgent", snapshot.urgent.length, "Homepage or 24h+ stale", snapshot.urgent.length ? "bad" : "good"],
    ["Fixed", snapshot.fixed.length, "Cleaned up", snapshot.fixed.length ? "good" : "warn"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v115 Stale Check</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Stale Check</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A quick freshness desk for the admin/editor beta workflow. Use it to catch old homepage items, unfinished drafts, missing media details and anything that makes the site feel neglected.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/core" className="hgn-btn-dark">Core</Link>
          <Link href="/admin/ship-check" className="hgn-btn-dark">Ship Check</Link>
          <Link href="/stale-check-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${staleToneClasses(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <h2 className="text-2xl font-black text-hgnNavy">Freshness items</h2>
          {snapshot.items.length ? (
            snapshot.items.map((item) => <StaleCard key={item.id} item={item} />)
          ) : (
            <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No stale items yet.</div>
          )}
        </div>

        <div className="grid gap-6">
          <form action={addStaleItem} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add freshness item</h2>
            <input name="title" placeholder="What feels stale or unfinished?" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="item_area" className="rounded-xl border px-4 py-3">
                <option value="homepage">Homepage</option>
                <option value="draft">Draft</option>
                <option value="media">Media</option>
                <option value="notice">Notice</option>
                <option value="utility">Utility</option>
              </select>
              <select name="item_status" className="rounded-xl border px-4 py-3">
                <option value="open">Open</option>
                <option value="review">Review</option>
                <option value="blocked">Blocked</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <input name="age_hours" type="number" min="0" placeholder="Approx age in hours" className="rounded-xl border px-4 py-3" />
            <textarea name="notes" placeholder="Short note" className="min-h-28 rounded-xl border px-4 py-3" />
            <button className="hgn-btn-primary">Add freshness item</button>
          </form>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Freshness rules</h2>
            <div className="mt-4 grid gap-3">
              {snapshot.rules.map((rule) => (
                <div key={rule.id} className="rounded-xl border bg-slate-50 p-4">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500">{rule.rule_area}</div>
                  <h3 className="mt-1 font-black text-hgnNavy">{rule.title}</h3>
                  {rule.helper ? <p className="mt-2 text-sm text-slate-700">{rule.helper}</p> : null}
                  <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-500">{rule.is_enabled ? "Enabled" : "Paused"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
