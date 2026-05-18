import Link from "next/link";
import { getTrimDeskSnapshot, trimToneClasses } from "@/lib/trim-desk";

export const dynamic = "force-dynamic";

export default async function TrimStatusPage() {
  const snapshot = await getTrimDeskSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className={`rounded-3xl border p-8 shadow-sm ${trimToneClasses(scoreTone)}`}>
        <p className="text-sm font-black uppercase tracking-widest opacity-70">HGN v109</p>
        <h1 className="mt-2 text-5xl font-black">Trim Status</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 opacity-80">
          A simple status view for whether the two-person admin/editor workflow is staying focused instead of getting buried in extra desks.
        </p>
        <div className="mt-6 text-6xl font-black">{snapshot.score}%</div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/admin/trim-desk" className="hgn-btn-dark">Open Trim Desk</Link>
          <Link href="/admin/core" className="hgn-btn-primary">Core Dashboard</Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Open</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.open.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Active</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.active.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.blockers.length}</div>
        </div>
      </section>
    </main>
  );
}
