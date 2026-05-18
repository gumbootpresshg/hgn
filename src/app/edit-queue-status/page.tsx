import Link from "next/link";
import { editQueueToneClasses, getEditQueueSnapshot } from "@/lib/edit-queue-lite";

export const dynamic = "force-dynamic";

export default async function EditQueueStatusPage() {
  const snapshot = await getEditQueueSnapshot();
  const tone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Edit Queue Status</p>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Final edit signal</h1>
        <p className="mt-4 max-w-3xl text-slate-700">
          This public-light status page gives the admin/editor team a quick read on whether today&apos;s stories are ready for copy, image, SEO and homepage publishing.
        </p>
        <div className={`mt-8 rounded-2xl border p-6 ${editQueueToneClasses(tone)}`}>
          <div className="text-xs font-black uppercase tracking-widest opacity-70">Readiness</div>
          <div className="mt-2 text-6xl font-black">{snapshot.score}%</div>
          <p className="mt-2 text-sm opacity-80">Based on active edit items, blockers, media checks and ready stories.</p>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="hgn-card p-5">
          <div className="text-3xl font-black text-hgnNavy">{snapshot.active.length}</div>
          <p className="mt-1 text-sm font-bold text-slate-600">Active</p>
        </div>
        <div className="hgn-card p-5">
          <div className="text-3xl font-black text-hgnNavy">{snapshot.ready.length}</div>
          <p className="mt-1 text-sm font-bold text-slate-600">Ready</p>
        </div>
        <div className="hgn-card p-5">
          <div className="text-3xl font-black text-hgnNavy">{snapshot.blocked.length}</div>
          <p className="mt-1 text-sm font-bold text-slate-600">Blocked</p>
        </div>
        <div className="hgn-card p-5">
          <div className="text-3xl font-black text-hgnNavy">{snapshot.needsMedia.length}</div>
          <p className="mt-1 text-sm font-bold text-slate-600">Needs media</p>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/admin/edit-queue" className="hgn-btn-primary">Open Edit Queue</Link>
        <Link href="/admin/today-board" className="hgn-btn-dark">Today Board</Link>
        <Link href="/admin/media-flow" className="hgn-btn-dark">Media Flow</Link>
      </div>
    </main>
  );
}
