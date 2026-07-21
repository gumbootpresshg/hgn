import Link from "next/link";
import { getWrapDeskSnapshot, wrapToneClasses } from "@/lib/wrap-desk";

export const dynamic = "force-dynamic";

export default async function WrapStatusPage() {
  const snapshot = await getWrapDeskSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Wrap status</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Day close</h1>
          <p className="mt-3 max-w-2xl text-slate-700">A quick public-safe view of whether today is wrapped, tomorrow is clear and blockers are not hidden in memory.</p>
        </div>
        <Link href="/admin/wrap-desk" className="hgn-btn-primary">Open Wrap Desk</Link>
      </div>

      <section className={`mt-8 rounded-3xl border p-8 shadow-sm ${wrapToneClasses(scoreTone)}`}>
        <p className="text-xs font-black uppercase tracking-widest opacity-70">Wrap readiness</p>
        <div className="mt-2 text-6xl font-black">{snapshot.score}%</div>
        <p className="mt-3 text-sm leading-6 opacity-80">
          {snapshot.blockers.length ? "There are blockers or carry-forward items to name before closing the day." : "No blockers are currently flagged in the wrap desk."}
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="hgn-card p-5">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Open</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.open.length}</div>
        </div>
        <div className="hgn-card p-5">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Done</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.done.length}</div>
        </div>
        <div className="hgn-card p-5">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Tomorrow</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.tomorrow.length}</div>
        </div>
        <div className="hgn-card p-5">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.blockers.length}</div>
        </div>
      </section>
    </main>
  );
}
