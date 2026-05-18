import Link from "next/link";
import { focusToneClasses, getFocusBoardSnapshot } from "@/lib/focus-board";

export const dynamic = "force-dynamic";

export default async function FocusStatusPage() {
  const snapshot = await getFocusBoardSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Focus status</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Today&apos;s focus</h1>
          <p className="mt-3 max-w-2xl text-slate-700">A quick view of whether the admin/editor workflow has a small, clear priority list for today.</p>
        </div>
        <Link href="/admin/focus-board" className="hgn-btn-primary">Open Focus Board</Link>
      </div>

      <section className={`mt-8 rounded-3xl border p-8 shadow-sm ${focusToneClasses(scoreTone)}`}>
        <p className="text-xs font-black uppercase tracking-widest opacity-70">Focus readiness</p>
        <div className="mt-2 text-6xl font-black">{snapshot.score}%</div>
        <p className="mt-3 text-sm leading-6 opacity-80">
          {snapshot.blockers.length ? "There are blockers in the focus board." : "No blockers are currently flagged in the focus board."}
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
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Top priority</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.topPriority.length}</div>
        </div>
        <div className="hgn-card p-5">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.blockers.length}</div>
        </div>
      </section>
    </main>
  );
}
