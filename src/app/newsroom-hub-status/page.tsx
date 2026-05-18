import Link from "next/link";
import { getNewsroomHubSnapshot, hubTone } from "@/lib/newsroom-consolidation";

export const dynamic = "force-dynamic";

export default async function NewsroomHubStatusPage() {
  const snapshot = await getNewsroomHubSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-3xl bg-hgnNavy p-8 text-white shadow-sm">
        <p className="text-sm font-black uppercase tracking-widest text-hgnGold">v118 Newsroom Hub Status</p>
        <h1 className="mt-3 text-5xl font-black">Is the workflow getting simpler?</h1>
        <p className="mt-4 max-w-3xl text-white/80">
          A public-safe status view for the consolidation phase. The goal is fewer screens, clearer priorities and less admin/editor dashboard hopping.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/admin/newsroom-hub" className="hgn-btn-primary">Open Newsroom Hub</Link>
          <Link href="/admin/core" className="rounded-xl border border-white/30 px-4 py-3 text-sm font-black text-white">Core</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className={`rounded-2xl border p-5 shadow-sm ${hubTone(scoreTone)}`}>
          <div className="text-xs font-black uppercase tracking-widest opacity-70">Consolidation score</div>
          <div className="mt-2 text-5xl font-black">{snapshot.score}%</div>
          <p className="mt-2 text-sm opacity-80">Higher means the day can be run from fewer places.</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Active items</div>
          <div className="mt-2 text-5xl font-black text-hgnNavy">{snapshot.active.length}</div>
          <p className="mt-2 text-sm text-slate-600">Open items in the hub.</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Blocked</div>
          <div className="mt-2 text-5xl font-black text-hgnNavy">{snapshot.blocked.length}</div>
          <p className="mt-2 text-sm text-slate-600">Needs attention before publishing feels smooth.</p>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-hgnNavy">Visible priority list</h2>
        <div className="mt-4 grid gap-3">
          {snapshot.active.slice(0, 6).map((item) => (
            <div key={item.id} className="rounded-xl border bg-slate-50 p-4">
              <div className="text-xs font-black uppercase tracking-widest text-slate-500">{item.area} · {item.item_status}</div>
              <h3 className="mt-1 font-black text-hgnNavy">{item.title}</h3>
            </div>
          ))}
          {!snapshot.active.length ? <p className="text-sm text-slate-600">No active hub items right now.</p> : null}
        </div>
      </section>
    </main>
  );
}
