import Link from "next/link";
import { frontpageRadarTone, getFrontpageRadarSnapshot } from "@/lib/frontpage-radar";

export const dynamic = "force-dynamic";

export default async function FrontpageRadarStatusPage() {
  const snapshot = await getFrontpageRadarSnapshot();
  const tone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className={`rounded-3xl border p-8 shadow-sm ${frontpageRadarTone(tone)}`}>
        <p className="text-sm font-black uppercase tracking-widest opacity-70">Frontpage Radar Status</p>
        <h1 className="mt-2 text-5xl font-black">{snapshot.score}%</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 opacity-80">
          Current homepage readiness score based on open frontpage issues, hero checks, urgency and completed radar items.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/admin/frontpage-radar" className="hgn-btn-dark">Open Frontpage Radar</Link>
          <Link href="/" className="hgn-btn-primary">View Homepage</Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="hgn-card p-5">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Open</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.open.length}</div>
        </div>
        <div className="hgn-card p-5">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Urgent</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.urgent.length}</div>
        </div>
        <div className="hgn-card p-5">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Cleared</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.cleared.length}</div>
        </div>
      </section>
    </main>
  );
}
