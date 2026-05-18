import Link from "next/link";
import { getLaunchRehearsalSnapshot } from "@/lib/launch-rehearsal";

export const dynamic = "force-dynamic";

export default async function LaunchRehearsalStatusPage() {
  const snapshot = await getLaunchRehearsalSnapshot();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <section className="rounded-3xl border bg-white p-6 shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN launch rehearsal</p>
        <h1 className="mt-3 text-4xl font-black text-hgnNavy">Soft-beta upload readiness</h1>
        <p className="mt-3 text-slate-700">
          This page gives a simple status snapshot for the online beta rehearsal without exposing the full admin workspace.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Score</p>
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
        <p className="mt-6 rounded-2xl bg-slate-950 p-4 text-sm font-bold text-white">{snapshot.recommendation}</p>
        <Link href="/admin/launch-rehearsal" className="mt-6 inline-flex rounded-full bg-hgnBlue px-5 py-3 text-sm font-black uppercase tracking-widest text-white">
          Open admin rehearsal
        </Link>
      </section>
    </main>
  );
}
