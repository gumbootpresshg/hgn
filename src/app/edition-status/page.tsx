import Link from "next/link";
import { editionToneClasses, getEditionPlannerSnapshot } from "@/lib/edition-planner";

export const dynamic = "force-dynamic";

export default async function EditionStatusPage() {
  const snapshot = await getEditionPlannerSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className={`rounded-3xl border p-8 shadow-sm ${editionToneClasses(scoreTone)}`}>
        <p className="text-sm font-black uppercase tracking-widest opacity-70">HGN v110</p>
        <h1 className="mt-2 text-5xl font-black">Edition Status</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 opacity-80">
          A simple readout for whether today&apos;s homepage and publishing plan are ready for the two-person admin/editor workflow.
        </p>
        <div className="mt-6 text-6xl font-black">{snapshot.score}%</div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/admin/edition-planner" className="hgn-btn-dark">Open Edition Planner</Link>
          <Link href="/admin/core" className="hgn-btn-primary">Core Dashboard</Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Open</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.open.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Ready</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.ready.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.blockers.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Lead picked</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.lead ? "Yes" : "No"}</div>
        </div>
      </section>
    </main>
  );
}
