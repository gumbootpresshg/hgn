import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getNewsroomHubSnapshot, hubTone, toneForHubItem } from "@/lib/newsroom-consolidation";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addHubItem(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await supabase.from("newsroom_hub_items").insert({
    title,
    area: String(formData.get("area") || "publishing"),
    item_status: String(formData.get("item_status") || "next"),
    priority: String(formData.get("priority") || "today"),
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    notes: String(formData.get("notes") || "").trim() || null,
    source_screen: String(formData.get("source_screen") || "Newsroom Hub").trim() || "Newsroom Hub",
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateHubItemStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  await supabase
    .from("newsroom_hub_items")
    .update({ item_status: String(formData.get("item_status") || "next"), updated_at: new Date().toISOString() })
    .eq("id", id);
}

function HubItemCard({ item }: { item: Row }) {
  const tone = toneForHubItem(item);

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${hubTone(tone)}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{item.area}</span>
        <span>{item.item_status}</span>
        <span>{item.priority}</span>
      </div>
      <h3 className="mt-2 text-xl font-black">{item.title}</h3>
      <p className="mt-2 text-sm font-bold opacity-80">Owner: {item.owner}</p>
      {item.source_screen ? <p className="mt-1 text-xs font-black uppercase tracking-widest opacity-60">From: {item.source_screen}</p> : null}
      {item.notes ? <p className="mt-3 text-sm leading-6 opacity-80">{item.notes}</p> : null}
      <form action={updateHubItemStatus} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="id" value={item.id} />
        {["next", "ready", "waiting", "blocked", "shipped", "dropped"].map((status) => (
          <button key={status} name="item_status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
            {status}
          </button>
        ))}
      </form>
    </article>
  );
}

export default async function NewsroomHubPage() {
  const snapshot = await getNewsroomHubSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";
  const stats = [
    ["Hub score", `${snapshot.score}%`, "How consolidated the day feels", scoreTone],
    ["Ready", snapshot.ready.length, "Can move now", snapshot.ready.length ? "good" : "warn"],
    ["Blocked", snapshot.blocked.length, "Needs attention", snapshot.blocked.length ? "bad" : "good"],
    ["Active", snapshot.active.length, "Open items in one place", snapshot.active.length > 7 ? "warn" : "blue"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v118 Newsroom Consolidation</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Newsroom Hub</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            One compact admin/editor hub for the two-person beta workflow. Use this before opening several separate desks.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/core" className="hgn-btn-dark">Core</Link>
          <Link href="/admin/newsroom" className="hgn-btn-dark">Newsroom</Link>
          <Link href="/newsroom-hub-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${hubTone(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <h2 className="text-2xl font-black text-hgnNavy">Needs attention</h2>
          {snapshot.items.length ? (
            snapshot.items.map((item) => <HubItemCard key={item.id} item={item} />)
          ) : (
            <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No hub items yet.</div>
          )}
        </div>

        <div className="grid gap-6">
          <form action={addHubItem} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add one thing</h2>
            <input name="title" placeholder="What needs attention?" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="area" className="rounded-xl border px-4 py-3">
                <option value="publishing">Publishing</option>
                <option value="homepage">Homepage</option>
                <option value="media">Media</option>
                <option value="live">Live</option>
                <option value="handoff">Handoff</option>
                <option value="cleanup">Cleanup</option>
              </select>
              <select name="priority" className="rounded-xl border px-4 py-3">
                <option value="today">Today</option>
                <option value="soon">Soon</option>
                <option value="urgent">Urgent</option>
                <option value="later">Later</option>
              </select>
            </div>
            <input name="owner" placeholder="Admin / Editor" className="rounded-xl border px-4 py-3" />
            <input name="source_screen" placeholder="Source screen or reason" className="rounded-xl border px-4 py-3" />
            <textarea name="notes" placeholder="Short note" className="min-h-28 rounded-xl border px-4 py-3" />
            <button className="hgn-btn-primary" type="submit">Add to hub</button>
          </form>

          <section className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Keep these, hide the rest</h2>
            <p className="mt-2 text-sm text-slate-600">The hub points to the few screens worth using during the two-person beta.</p>
            <div className="mt-4 grid gap-3">
              {snapshot.links.map((link) => (
                <Link key={link.id} href={link.href || "/admin"} className="rounded-xl border bg-white p-4 transition hover:border-hgnBlue hover:bg-blue-50">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500">{link.link_group} · {link.link_status}</div>
                  <h3 className="mt-1 font-black text-hgnNavy">{link.title}</h3>
                  {link.reason ? <p className="mt-1 text-sm text-slate-600">{link.reason}</p> : null}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
