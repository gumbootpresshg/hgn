import Link from "next/link";
import { getNextUpSnapshot, nextUpTone } from "@/lib/next-up";

export const dynamic = "force-dynamic";

export default async function NextUpStatusPage() {
  const snapshot = await getNextUpSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-3xl bg-hgnNavy p-8 text-white shadow-sm">
        <p className="text-sm font-black uppercase tracking-widest text-hgnGold">v117 Next-Up Status</p>
        <h1 className="mt-3 text-5xl font-black">What should move next?</h1>
        <p className="mt-4 max-w-3xl text-white/80">
          A simple public-safe status page for the two-person admin/editor beta workflow. It keeps the next publishing decision visible without exposing private notes.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/admin/next-up" className="hgn-btn-primary">Open Next-Up Desk</Link>
          <Link href="/admin/core" className="rounded-xl border border-white/30 px-4 py-3 text-sm font-black text-white">Core</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className={`rounded-2xl border p-5 shadow-sm ${nextUpTone(scoreTone)}`}>
          <div className="text-xs font-black uppercase tracking-widest opacity-70">Clarity score</div>
          <div className="mt-2 text-5xl font-black">{snapshot.score}%</div>
          <p className="mt-2 text-sm opacity-80">Higher means the next publish decision is clear.</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Ready now</div>
          <div className="mt-2 text-5xl font-black text-hgnNavy">{snapshot.ready.length}</div>
          <p className="mt-2 text-sm text-slate-600">Items ready to move.</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Blocked</div>
          <div className="mt-2 text-5xl font-black text-hgnNavy">{snapshot.blocked.length}</div>
          <p className="mt-2 text-sm text-slate-600">Items needing attention.</p>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-hgnNavy">Visible next-up list</h2>
        <div className="mt-4 grid gap-3">
          {snapshot.open.slice(0, 6).map((item) => (
            <div key={item.id} className="rounded-xl border bg-slate-50 p-4">
              <div className="text-xs font-black uppercase tracking-widest text-slate-500">{item.lane} · {item.item_status}</div>
              <h3 className="mt-1 font-black text-hgnNavy">{item.title}</h3>
            </div>
          ))}
          {!snapshot.open.length ? <p className="text-sm text-slate-600">No open next-up items right now.</p> : null}
        </div>
      </section>
    </main>
  );
}
