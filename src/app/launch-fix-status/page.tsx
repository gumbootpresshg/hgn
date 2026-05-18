import Link from "next/link";
import { getLaunchFixPackSnapshot } from "@/lib/launch-fix-pack";

export const dynamic = "force-dynamic";

export default async function LaunchFixStatusPage() {
  const snapshot = await getLaunchFixPackSnapshot();
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-3xl border bg-white p-6 shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN v137</p>
        <h1 className="mt-3 text-4xl font-black text-hgnNavy">Launch Fix Status</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          A simple public-safe status page for the final SQL, route, and deployment repair pass before HGN goes online for soft beta.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Fix confidence</p>
            <p className="mt-2 text-5xl font-black text-hgnNavy">{snapshot.score}%</p>
          </div>
          <div className="rounded-2xl border bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</p>
            <p className="mt-2 text-5xl font-black text-hgnBlue">{snapshot.blockers.length}</p>
          </div>
          <div className="rounded-2xl border bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Critical open</p>
            <p className="mt-2 text-5xl font-black text-orange-700">{snapshot.criticalOpen.length}</p>
          </div>
        </div>
        <p className="mt-6 rounded-2xl bg-slate-950 p-4 text-sm font-bold text-white">Recommendation: {snapshot.recommendation}</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-hgnBlue px-5 py-3 text-sm font-black text-white">Back to HGN</Link>
      </section>
    </main>
  );
}
