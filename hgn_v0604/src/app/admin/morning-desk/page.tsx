import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getMorningDeskSnapshot, morningToneClasses, toneForMorningItem } from "@/lib/morning-desk";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addMorningItem(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await supabase.from("morning_desk_items").insert({
    title,
    lane: String(formData.get("lane") || "publishing"),
    item_status: String(formData.get("item_status") || "open"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    target_time: String(formData.get("target_time") || "morning").trim() || "morning",
    notes: String(formData.get("notes") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateMorningStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  await supabase
    .from("morning_desk_items")
    .update({ item_status: String(formData.get("item_status") || "open"), updated_at: new Date().toISOString() })
    .eq("id", id);
}

function MorningCard({ item }: { item: Row }) {
  const tone = toneForMorningItem(item);

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${morningToneClasses(tone)}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{item.lane}</span>
        <span>·</span>
        <span>{item.item_status}</span>
        <span>·</span>
        <span>{item.target_time}</span>
      </div>
      <h3 className="mt-2 text-xl font-black">{item.title}</h3>
      <p className="mt-2 text-sm font-bold opacity-80">Owner: {item.owner}</p>
      {item.notes ? <p className="mt-3 text-sm leading-6 opacity-80">{item.notes}</p> : null}
      <form action={updateMorningStatus} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="id" value={item.id} />
        {["open", "waiting", "needs_review", "ready", "blocked", "done", "dropped"].map((status) => (
          <button key={status} name="item_status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
            {status}
          </button>
        ))}
      </form>
    </article>
  );
}

export default async function MorningDeskPage() {
  const snapshot = await getMorningDeskSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";
  const stats = [
    ["Morning score", `${snapshot.score}%`, "How ready the day feels", scoreTone],
    ["Open", snapshot.open.length, "Still needs attention", snapshot.open.length > 8 ? "warn" : "good"],
    ["Ready", snapshot.ready.length, "Ready or finished", snapshot.ready.length >= 3 ? "good" : "warn"],
    ["Blockers", snapshot.blockers.length, "Must clear first", snapshot.blockers.length ? "bad" : "good"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v111 Morning Desk</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Morning Desk</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A simple start-of-day board for the two-person admin/editor workflow. Pick the lead, check the homepage, spot blockers and decide what goes live first.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/core" className="hgn-btn-dark">Core</Link>
          <Link href="/admin/edition-planner" className="hgn-btn-dark">Edition Planner</Link>
          <Link href="/morning-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${morningToneClasses(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      {snapshot.lead ? (
        <section className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 text-blue-950 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest opacity-70">First thing to decide</p>
          <h2 className="mt-2 text-3xl font-black">{snapshot.lead.title}</h2>
          {snapshot.lead.notes ? <p className="mt-3 max-w-3xl text-sm leading-6 opacity-80">{snapshot.lead.notes}</p> : null}
        </section>
      ) : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <h2 className="text-2xl font-black text-hgnNavy">Today&apos;s start list</h2>
          {snapshot.items.length ? (
            snapshot.items.map((item) => <MorningCard key={item.id} item={item} />)
          ) : (
            <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No morning desk items yet.</div>
          )}
        </div>

        <div className="grid gap-6">
          <form action={addMorningItem} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add morning item</h2>
            <input name="title" placeholder="Task, decision or update" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="lane" className="rounded-xl border px-4 py-3">
                <option value="lead">Lead</option>
                <option value="homepage">Homepage</option>
                <option value="publishing">Publishing</option>
                <option value="utility">Utility</option>
                <option value="handoff">Handoff</option>
              </select>
              <select name="item_status" className="rounded-xl border px-4 py-3">
                <option value="open">Open</option>
                <option value="waiting">Waiting</option>
                <option value="needs_review">Needs review</option>
                <option value="ready">Ready</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <input name="target_time" placeholder="Target time, like 9 AM or morning" className="rounded-xl border px-4 py-3" />
            <textarea name="notes" placeholder="Short admin/editor note" className="min-h-28 rounded-xl border px-4 py-3" />
            <button className="hgn-btn-primary">Add to morning desk</button>
          </form>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Morning checks</h2>
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
