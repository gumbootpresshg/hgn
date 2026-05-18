import Link from "next/link";
import { getSoftBetaLaunchSnapshot } from "@/lib/soft-beta-launch";

export const dynamic = "force-dynamic";

export default async function BetaReadyPage() {
  const snapshot = await getSoftBetaLaunchSnapshot();
  const status = snapshot.score >= 85 && snapshot.blockers.length === 0 ? "Ready for soft beta" : "Nearly ready";

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN soft beta</p>
        <h1 className="mt-3 text-4xl font-black text-hgnNavy">{status}</h1>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-700">
          HGN is moving from internal build mode into online soft-beta testing. The current focus is publishing reliability, homepage freshness, mobile readability and a simple admin/editor workflow.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Readiness</p>
            <p className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.score}%</p>
          </div>
          <div className="rounded-2xl border bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</p>
            <p className="mt-2 text-4xl font-black text-hgnBlue">{snapshot.blockers.length}</p>
          </div>
          <div className="rounded-2xl border bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Watch items</p>
            <p className="mt-2 text-4xl font-black text-amber-700">{snapshot.watch.length}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="hgn-btn-primary">View homepage</Link>
          <Link href="/admin/soft-beta-launch" className="hgn-btn-secondary">Admin launch cockpit</Link>
        </div>
      </section>
    </main>
  );
}
