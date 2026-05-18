import Link from "next/link";
import { getBetaFreezeSnapshot } from "@/lib/beta-freeze";

export const dynamic = "force-dynamic";

export default async function BetaFreezeStatusPage() {
  const snapshot = await getBetaFreezeSnapshot();
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Beta freeze status</p>
      <h1 className="mt-2 text-5xl font-black text-hgnNavy">Feature freeze readiness</h1>
      <p className="mt-3 max-w-3xl text-slate-700">
        A public-light status page for checking whether the admin/editor beta should keep adding features or pause for cleanup.
      </p>
      <section className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">
        <div className="text-xs font-black uppercase tracking-widest text-slate-500">Freeze score</div>
        <div className="mt-2 text-6xl font-black text-hgnNavy">{snapshot.score}%</div>
        <p className="mt-3 text-slate-700">Blockers: {snapshot.blockers.length}. Primary routes: {snapshot.primaryRoutes.length}. Parked routes: {snapshot.parkedRoutes.length}.</p>
        <Link href="/admin/beta-freeze" className="mt-6 inline-flex hgn-btn-primary">Open beta freeze prep</Link>
      </section>
    </main>
  );
}
