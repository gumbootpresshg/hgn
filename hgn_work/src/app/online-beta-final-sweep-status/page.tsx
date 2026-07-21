import Link from "next/link";
import { getOnlineBetaFinalSweepSnapshot } from "@/lib/online-beta-final-sweep";

export const dynamic = "force-dynamic";

export default async function OnlineBetaFinalSweepStatusPage() {
  const snapshot = await getOnlineBetaFinalSweepSnapshot();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-3xl border bg-white p-6 shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Online Beta</p>
        <h1 className="mt-2 text-4xl font-black text-hgnNavy">Final Sweep Status</h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          A simple public-safe status page for the admin/editor beta upload path. This does not expose internal notes beyond readiness counts.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Launch confidence</p>
          <p className="mt-2 text-5xl font-black text-hgnNavy">{snapshot.score}%</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</p>
          <p className="mt-2 text-5xl font-black text-hgnBlue">{snapshot.blockers.length}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Recommendation</p>
          <p className="mt-2 text-2xl font-black text-hgnNavy">{snapshot.recommendation}</p>
        </div>
      </section>

      <div className="mt-8">
        <Link href="/admin/online-beta-final-sweep" className="hgn-btn-primary">Open admin final sweep</Link>
      </div>
    </main>
  );
}
