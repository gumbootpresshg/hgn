import Link from "next/link";
import { getOnlineSoftBetaSnapshot } from "@/lib/online-soft-beta";

export const dynamic = "force-dynamic";

export default async function OnlineSoftBetaStatusPage() {
  const snapshot = await getOnlineSoftBetaSnapshot();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-3xl border bg-white p-6 shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Online soft beta</p>
        <h1 className="mt-3 text-4xl font-black text-hgnNavy">Beta Candidate Status</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          A simple public-safe snapshot for the admin/editor soft-beta upload candidate.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Readiness</p>
            <p className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.score}%</p>
          </div>
          <div className="rounded-2xl border bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</p>
            <p className="mt-2 text-4xl font-black text-hgnBlue">{snapshot.blockers.length}</p>
          </div>
          <div className="rounded-2xl border bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Critical open</p>
            <p className="mt-2 text-4xl font-black text-orange-700">{snapshot.criticalOpen.length}</p>
          </div>
        </div>
        <p className="mt-5 rounded-2xl bg-slate-950 p-4 text-sm font-bold leading-6 text-white">{snapshot.recommendation}</p>
        <Link href="/admin/online-soft-beta" className="mt-6 inline-flex rounded-full bg-hgnBlue px-5 py-3 text-sm font-black uppercase tracking-widest text-white">
          Open admin candidate board
        </Link>
      </section>
    </main>
  );
}
