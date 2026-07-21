import Link from "next/link";
import { getDailyRouteSnapshot } from "@/lib/daily-route";

export const dynamic = "force-dynamic";

export default async function DailyRouteStatusPage() {
  const snapshot = await getDailyRouteSnapshot();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Daily Route Status</p>
      <h1 className="mt-2 text-5xl font-black text-hgnNavy">{snapshot.score}% clean</h1>
      <p className="mt-3 max-w-3xl text-slate-700">
        This public-light status page summarizes whether the admin/editor route is staying simple enough for beta testing.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Daily route</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.daily.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Cleanup route</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.cleanup.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Notes</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.activeNotes.length}</div>
        </div>
      </div>
      <Link href="/admin/daily-route" className="mt-8 inline-flex hgn-btn-primary">Open Daily Route</Link>
    </main>
  );
}
