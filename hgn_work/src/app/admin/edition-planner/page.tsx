import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { editionToneClasses, getEditionPlannerSnapshot, toneForEditionItem } from "@/lib/edition-planner";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addEditionItem(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await supabase.from("edition_planner_items").insert({
    title,
    slot_type: String(formData.get("slot_type") || "secondary"),
    edition_status: String(formData.get("edition_status") || "planned"),
    homepage_area: String(formData.get("homepage_area") || "homepage").trim() || "homepage",
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    publish_window: String(formData.get("publish_window") || "today").trim() || "today",
    notes: String(formData.get("notes") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateEditionStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  await supabase
    .from("edition_planner_items")
    .update({
      edition_status: String(formData.get("edition_status") || "planned"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

function EditionCard({ item }: { item: Row }) {
  const tone = toneForEditionItem(item);

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${editionToneClasses(tone)}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{item.slot_type}</span>
        <span>·</span>
        <span>{item.edition_status}</span>
        <span>·</span>
        <span>{item.publish_window}</span>
      </div>
      <h3 className="mt-2 text-xl font-black">{item.title}</h3>
      <p className="mt-2 text-sm font-bold opacity-80">Homepage area: {item.homepage_area}</p>
      {item.notes ? <p className="mt-3 text-sm leading-6 opacity-80">{item.notes}</p> : null}
      <form action={updateEditionStatus} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="id" value={item.id} />
        {["planned", "drafting", "needs_edit", "needs_photo", "ready", "blocked", "published", "dropped"].map((status) => (
          <button key={status} name="edition_status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
            {status}
          </button>
        ))}
      </form>
    </article>
  );
}

export default async function EditionPlannerPage() {
  const snapshot = await getEditionPlannerSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";
  const stats = [
    ["Edition score", `${snapshot.score}%`, "How ready today feels", scoreTone],
    ["Open", snapshot.open.length, "Items still in motion", snapshot.open.length > 8 ? "warn" : "good"],
    ["Ready", snapshot.ready.length, "Ready or already published", snapshot.ready.length >= 2 ? "good" : "warn"],
    ["Blockers", snapshot.blockers.length, "Must clear before publishing", snapshot.blockers.length ? "bad" : "good"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v110 Edition Planner</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Edition Planner</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A compact daily edition board for the admin/editor beta. Decide the lead, homepage rhythm, what is ready and what still needs attention.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/core" className="hgn-btn-dark">Core</Link>
          <Link href="/admin/newsflow-board" className="hgn-btn-dark">Newsflow</Link>
          <Link href="/edition-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${editionToneClasses(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      {snapshot.lead ? (
        <section className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 text-blue-950 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest opacity-70">Today&apos;s lead</p>
          <h2 className="mt-2 text-3xl font-black">{snapshot.lead.title}</h2>
          {snapshot.lead.notes ? <p className="mt-3 max-w-3xl text-sm leading-6 opacity-80">{snapshot.lead.notes}</p> : null}
        </section>
      ) : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <h2 className="text-2xl font-black text-hgnNavy">Today&apos;s edition</h2>
          {snapshot.items.length ? (
            snapshot.items.map((item) => <EditionCard key={item.id} item={item} />)
          ) : (
            <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No edition items yet.</div>
          )}
        </div>

        <div className="grid gap-6">
          <form action={addEditionItem} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add edition item</h2>
            <input name="title" placeholder="Story, update or homepage item" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="slot_type" className="rounded-xl border px-4 py-3">
                <option value="lead">Lead</option>
                <option value="secondary">Secondary</option>
                <option value="brief">Brief</option>
                <option value="utility">Utility</option>
                <option value="community">Community</option>
              </select>
              <select name="edition_status" className="rounded-xl border px-4 py-3">
                <option value="planned">Planned</option>
                <option value="drafting">Drafting</option>
                <option value="needs_edit">Needs edit</option>
                <option value="needs_photo">Needs photo</option>
                <option value="ready">Ready</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <input name="homepage_area" placeholder="Homepage area" className="rounded-xl border px-4 py-3" />
            <input name="publish_window" placeholder="Publish window, like morning or afternoon" className="rounded-xl border px-4 py-3" />
            <textarea name="notes" placeholder="Short admin/editor note" className="min-h-28 rounded-xl border px-4 py-3" />
            <button className="hgn-btn-primary">Add to edition</button>
          </form>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Edition checks</h2>
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
