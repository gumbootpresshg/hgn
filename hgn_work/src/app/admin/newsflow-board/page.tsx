import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getNewsflowSnapshot, newsflowToneClasses, toneForNewsflowItem } from "@/lib/newsflow-board";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

async function addNewsflowItem(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  await supabase.from("newsflow_items").insert({
    title,
    item_type: String(formData.get("item_type") || "story"),
    flow_status: String(formData.get("flow_status") || "planned"),
    priority: String(formData.get("priority") || "normal"),
    target_slot: String(formData.get("target_slot") || "").trim() || null,
    article_slug: String(formData.get("article_slug") || "").trim() || null,
    owner: String(formData.get("owner") || "Admin / Editor").trim() || "Admin / Editor",
    notes: String(formData.get("notes") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 100),
  });
}

async function updateNewsflowItem(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  const status = String(formData.get("flow_status") || "planned");
  const isDone = status === "done";

  await supabase
    .from("newsflow_items")
    .update({
      flow_status: status,
      is_done: isDone,
      completed_at: isDone ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

function NewsflowCard({ item }: { item: Row }) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${newsflowToneClasses(toneForNewsflowItem(item))}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{item.item_type}</span>
        <span>·</span>
        <span>{item.flow_status}</span>
        <span>·</span>
        <span>{item.priority}</span>
        {item.target_slot ? <span>· {item.target_slot}</span> : null}
      </div>
      <h3 className="mt-2 text-xl font-black">{item.title}</h3>
      {item.article_slug ? <p className="mt-2 text-sm font-bold opacity-80">Slug: {item.article_slug}</p> : null}
      {item.notes ? <p className="mt-3 text-sm leading-6 opacity-80">{item.notes}</p> : null}
      <form action={updateNewsflowItem} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="id" value={item.id} />
        {["planned", "active", "waiting", "blocked", "done"].map((status) => (
          <button key={status} name="flow_status" value={status} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">
            {status}
          </button>
        ))}
      </form>
    </article>
  );
}

export default async function NewsflowBoardPage() {
  const snapshot = await getNewsflowSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";
  const stats = [
    ["Newsflow", `${snapshot.score}%`, "Today rhythm", scoreTone],
    ["Open", snapshot.open.length, "Keep it manageable", snapshot.open.length > 6 ? "warn" : "good"],
    ["Active", snapshot.active.length, "Currently moving", snapshot.active.length ? "blue" : "neutral"],
    ["Urgent", snapshot.urgent.length, "Needs attention", snapshot.urgent.length ? "bad" : "good"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v108 Newsflow Board</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Newsflow Board</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A lightweight admin/editor board for seeing the day at a glance: what is moving, what is stale, what is blocked and what should lead the homepage.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/core" className="hgn-btn-dark">Core</Link>
          <Link href="/admin/today-board" className="hgn-btn-dark">Today Board</Link>
          <Link href="/newsflow-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper, tone]) => (
          <div key={label} className={`rounded-2xl border p-5 shadow-sm ${newsflowToneClasses(String(tone))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{label}</div>
            <div className="mt-2 text-4xl font-black">{value}</div>
            <p className="mt-2 text-sm opacity-80">{helper}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <h2 className="text-2xl font-black text-hgnNavy">Today flow</h2>
          {snapshot.items.length ? (
            snapshot.items.map((item) => <NewsflowCard key={item.id} item={item} />)
          ) : (
            <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-600">No newsflow items yet.</div>
          )}
        </div>

        <div className="grid gap-6">
          <form action={addNewsflowItem} className="hgn-card grid gap-3 p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Add flow item</h2>
            <input name="title" placeholder="What needs to move today?" className="rounded-xl border px-4 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <select name="item_type" className="rounded-xl border px-4 py-3">
                <option value="story">Story</option>
                <option value="homepage">Homepage</option>
                <option value="live">Live</option>
                <option value="media">Media</option>
                <option value="handoff">Handoff</option>
              </select>
              <select name="priority" className="rounded-xl border px-4 py-3">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <input name="target_slot" placeholder="Homepage lead, sidebar, newsletter, etc." className="rounded-xl border px-4 py-3" />
            <input name="article_slug" placeholder="Optional article slug" className="rounded-xl border px-4 py-3" />
            <textarea name="notes" placeholder="Short note" className="min-h-28 rounded-xl border px-4 py-3" />
            <button className="hgn-btn-primary">Add to flow</button>
          </form>

          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Flow checks</h2>
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
