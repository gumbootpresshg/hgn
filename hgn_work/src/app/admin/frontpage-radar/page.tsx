import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { frontpageRadarTone, getFrontpageRadarSnapshot, toneForFrontpageItem } from "@/lib/frontpage-radar";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addRadarItem(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await supabase.from("frontpage_radar_items").insert({
    title,
    item_area: String(formData.get("item_area") || "homepage"),
    item_status: String(formData.get("item_status") || "open"),
    severity: String(formData.get("severity") || "watch"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    notes: String(formData.get("notes") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateRadarStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  await supabase
    .from("frontpage_radar_items")
    .update({ item_status: String(formData.get("item_status") || "open"), updated_at: new Date().toISOString() })
    .eq("id", id);
}

function RadarCard({ item }: { item: Row }) {
  const tone = toneForFrontpageItem(item);

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${frontpageRadarTone(tone)}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{item.item_area}</span>
        <span>{item.item_status}</span>
        <span>{item.severity}</span>
      </div>
      <h3 className="mt-2 text-xl font-black">{item.title}</h3>
      <p className="mt-2 text-sm font-bold opacity-80">Owner: {item.owner}</p>
      {item.notes ? <p className="mt-3 text-sm leading-6 opacity-80">{item.notes}</p> : null}
      <form action={updateRadarStatus} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="id" value={item.id} />
        {["open", "review", "urgent", "cleared", "blocked", "dropped"].map((status) => (
          <button key={status} name="item_status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
            {status}
          </button>
        ))}
      </form>
    </article>
  );
}

export default async function FrontpageRadarPage() {
  const snapshot = await getFrontpageRadarSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";
  const stats = [
    ["Frontpage score", `${snapshot.score}%`, "How strong the homepage feels right now", scoreTone],
    ["Open", snapshot.open.length, "Needs a decision", snapshot.open.length > 4 ? "warn" : "good"],
    ["Urgent", snapshot.urgent.length, "Fix before sharing", snapshot.urgent.length ? "bad" : "good"],
    ["Hero checks", snapshot.hero.length, "Lead story items", snapshot.hero.length ? "warn" : "good"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v116 Frontpage Radar</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Frontpage Radar</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A lightweight scan for homepage freshness, story balance, repeated topics and weak image coverage. Built for the two-person admin/editor beta workflow.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/core" className="hgn-btn-dark">Core</Link>
          <Link href="/admin/stale-check" className="hgn-btn-dark">Stale Check</Link>
          <Link href="/frontpage-radar-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${frontpageRadarTone(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <h2 className="text-2xl font-black text-hgnNavy">Radar items</h2>
          {snapshot.items.length ? (
            snapshot.items.map((item) => <RadarCard key={item.id} item={item} />)
          ) : (
            <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No frontpage radar items yet.</div>
          )}
        </div>

        <div className="grid gap-6">
          <form action={addRadarItem} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add frontpage issue</h2>
            <input name="title" placeholder="What should be checked?" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="item_area" className="rounded-xl border px-4 py-3">
                <option value="hero">Hero</option>
                <option value="homepage">Homepage</option>
                <option value="balance">Balance</option>
                <option value="media">Media</option>
                <option value="mobile">Mobile</option>
              </select>
              <select name="severity" className="rounded-xl border px-4 py-3">
                <option value="watch">Watch</option>
                <option value="needs-look">Needs look</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <input name="owner" placeholder="Admin / Editor" className="rounded-xl border px-4 py-3" />
            <textarea name="notes" placeholder="Notes" className="min-h-28 rounded-xl border px-4 py-3" />
            <button className="hgn-btn-primary" type="submit">Add item</button>
          </form>

          <section className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Radar checks</h2>
            <div className="mt-4 grid gap-3">
              {snapshot.checks.map((check) => (
                <div key={check.id} className="rounded-xl border bg-white p-4">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500">{check.check_area} · {check.check_status}</div>
                  <h3 className="mt-1 font-black text-hgnNavy">{check.title}</h3>
                  {check.helper ? <p className="mt-1 text-sm text-slate-600">{check.helper}</p> : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
