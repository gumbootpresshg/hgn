import Link from "next/link";
import { getQuickshotSnapshot, quickshotToneClasses } from "@/lib/quickshot-publisher";

export const dynamic = "force-dynamic";

export default async function QuickshotStatusPage() {
  const snapshot = await getQuickshotSnapshot();
  const tone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Quickshot Status</p>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Small updates, fewer clicks</h1>
        <p className="mt-4 max-w-3xl text-slate-700">
          This page gives the admin/editor team a simple signal for whether quick local updates are ready to publish or need attention.
        </p>
        <div className={`mt-8 rounded-2xl border p-6 ${quickshotToneClasses(tone)}`}>
          <div className="text-xs font-black uppercase tracking-widest opacity-70">Readiness</div>
          <div className="mt-2 text-6xl font-black">{snapshot.score}%</div>
          <p className="mt-2 text-sm opacity-80">Based on drafts, blockers, templates and ready updates.</p>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="hgn-card p-5">
          <div className="text-3xl font-black text-hgnNavy">{snapshot.drafts.length}</div>
          <p className="mt-1 text-sm font-bold text-slate-600">Drafts</p>
        </div>
        <div className="hgn-card p-5">
          <div className="text-3xl font-black text-hgnNavy">{snapshot.ready.length}</div>
          <p className="mt-1 text-sm font-bold text-slate-600">Ready or homepage-ready</p>
        </div>
        <div className="hgn-card p-5">
          <div className="text-3xl font-black text-hgnNavy">{snapshot.blockers.length}</div>
          <p className="mt-1 text-sm font-bold text-slate-600">Blocked or photo-needed</p>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/admin/quickshot" className="hgn-btn-primary">Open Quickshot</Link>
        <Link href="/admin/today-board" className="hgn-btn-dark">Today Board</Link>
      </div>
    </main>
  );
}
