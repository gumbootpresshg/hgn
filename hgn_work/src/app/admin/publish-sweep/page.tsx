import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getPublishSweepSnapshot, sweepTone, sweepToneClasses } from "@/lib/publish-sweep";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addSweep(formData: FormData) {
  "use server";

  await supabase.from("publish_sweeps").insert({
    sweep_date: String(formData.get("sweep_date") || new Date().toISOString().slice(0, 10)),
    title: String(formData.get("title") || "Today's final publish sweep").trim(),
    status: String(formData.get("status") || "open"),
    lead_story: String(formData.get("lead_story") || "").trim() || null,
    homepage_focus: String(formData.get("homepage_focus") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function addSweepItem(formData: FormData) {
  "use server";

  const itemTitle = String(formData.get("item_title") || "").trim();
  if (!itemTitle) return;

  await supabase.from("publish_sweep_items").insert({
    item_title: itemTitle,
    item_type: String(formData.get("item_type") || "final_check"),
    status: String(formData.get("status") || "open"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    is_blocking: formData.get("is_blocking") === "on",
    sort_order: Number(formData.get("sort_order") || 100),
    notes: String(formData.get("notes") || "").trim() || null,
  });
}

async function updateItemStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status) return;

  const patch: Row = { status, updated_at: new Date().toISOString() };
  if (status === "done" || status === "cleared") patch.completed_at = new Date().toISOString();
  await supabase.from("publish_sweep_items").update(patch).eq("id", id);
}

function StatusButtons({ id }: { id: string }) {
  const states = ["open", "needs_fix", "waiting", "blocked", "cleared", "done", "dropped"];

  return (
    <form action={updateItemStatus} className="mt-3 flex flex-wrap gap-2">
      <input type="hidden" name="id" value={id} />
      {states.map((state) => (
        <button
          key={state}
          name="status"
          value={state}
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white"
        >
          {state}
        </button>
      ))}
    </form>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-sm text-slate-600">{label}</div>;
}

export default async function PublishSweepAdminPage() {
  const snapshot = await getPublishSweepSnapshot();
  const scoreTone = snapshot.score >= 80 ? "good" : snapshot.score >= 55 ? "warn" : "bad";
  const stats = [
    ["Sweep ready", `${snapshot.score}%`, "Final checks before publish", scoreTone],
    ["Open checks", snapshot.openItems.length, "Keep the list short", snapshot.openItems.length > 8 ? "warn" : "good"],
    ["Blockers", snapshot.blockers.length, "Fix before going live", snapshot.blockers.length ? "bad" : "good"],
    ["Cleared", snapshot.clearedItems.length, "Checks already handled", snapshot.clearedItems.length ? "good" : "neutral"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v99 Admin/Editor Workflow</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Publish Sweep</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A final, lightweight checklist for the two of you before a story or homepage update goes live.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/publish-brief" className="hgn-btn-dark">Publish Brief</Link>
          <Link href="/admin/fast-publish" className="hgn-btn-dark">Fast Publish</Link>
          <Link href="/publish-sweep-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${sweepToneClasses(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-6">
          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Today&apos;s sweep</h2>
            {snapshot.todaySweep ? (
              <article className="mt-4 rounded-2xl border bg-slate-50 p-5">
                <div className="text-xs font-black uppercase tracking-widest text-slate-500">
                  {snapshot.todaySweep.sweep_date} · {snapshot.todaySweep.status}
                </div>
                <h3 className="mt-2 text-xl font-black text-hgnNavy">{snapshot.todaySweep.title}</h3>
                <dl className="mt-4 grid gap-3 text-sm text-slate-700">
                  <div>
                    <dt className="font-black text-slate-900">Lead story</dt>
                    <dd>{snapshot.todaySweep.lead_story || "Not set"}</dd>
                  </div>
                  <div>
                    <dt className="font-black text-slate-900">Homepage focus</dt>
                    <dd>{snapshot.todaySweep.homepage_focus || "Not set"}</dd>
                  </div>
                  <div>
                    <dt className="font-black text-slate-900">Notes</dt>
                    <dd>{snapshot.todaySweep.notes || "No notes"}</dd>
                  </div>
                </dl>
              </article>
            ) : (
              <EmptyState label="No publish sweep yet. Add one below when you are preparing the next update." />
            )}
          </div>

          <form action={addSweep} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Start a sweep</h2>
            <input name="sweep_date" type="date" className="rounded-xl border px-4 py-3" />
            <input name="title" placeholder="Sweep title" className="rounded-xl border px-4 py-3" />
            <input name="lead_story" placeholder="Lead story" className="rounded-xl border px-4 py-3" />
            <input name="homepage_focus" placeholder="Homepage focus" className="rounded-xl border px-4 py-3" />
            <textarea name="notes" placeholder="Notes" className="min-h-24 rounded-xl border px-4 py-3" />
            <button className="hgn-btn-primary">Save sweep</button>
          </form>
        </div>

        <div className="grid gap-6">
          <form action={addSweepItem} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add final check</h2>
            <input name="item_title" placeholder="Check title" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="item_type" className="rounded-xl border px-4 py-3">
                <option value="final_check">Final check</option>
                <option value="copy">Copy</option>
                <option value="media">Media</option>
                <option value="homepage">Homepage</option>
                <option value="seo">SEO</option>
                <option value="mobile">Mobile</option>
              </select>
              <select name="owner" className="rounded-xl border px-4 py-3">
                <option>Admin / Editor</option>
                <option>Admin</option>
                <option>Editor</option>
              </select>
            </div>
            <textarea name="notes" placeholder="Notes" className="min-h-20 rounded-xl border px-4 py-3" />
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <input name="is_blocking" type="checkbox" /> Blocking item
            </label>
            <button className="hgn-btn-primary">Add check</button>
          </form>

          <section className="grid gap-4">
            {snapshot.items.length ? (
              snapshot.items.map((item) => {
                const tone = sweepTone(item.status, item.is_blocking);
                return (
                  <article key={item.id} className={`rounded-2xl border p-5 shadow-sm ${sweepToneClasses(tone)}`}>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-widest opacity-70">
                      <span>{item.item_type}</span>
                      <span>·</span>
                      <span>{item.owner || "Admin / Editor"}</span>
                      <span>·</span>
                      <span>{item.status}</span>
                    </div>
                    <h3 className="mt-2 text-xl font-black">{item.item_title}</h3>
                    {item.notes ? <p className="mt-2 text-sm opacity-80">{item.notes}</p> : null}
                    {item.is_blocking ? <p className="mt-2 text-sm font-black text-rose-700">Blocking publish until cleared.</p> : null}
                    <StatusButtons id={item.id} />
                  </article>
                );
              })
            ) : (
              <EmptyState label="No final checks yet." />
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
