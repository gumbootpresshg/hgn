import Link from "next/link";
import { getPublishingCompassSnapshot, publishingCompassToneClasses } from "@/lib/publishing-compass";

export const dynamic = "force-dynamic";

export default async function PublishingCompassStatusPage() {
  const snapshot = await getPublishingCompassSnapshot();
  const tone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className={`rounded-3xl border p-8 shadow-sm ${publishingCompassToneClasses(tone)}`}>
        <p className="text-sm font-black uppercase tracking-widest opacity-70">Publishing Compass Status</p>
        <h1 className="mt-2 text-5xl font-black">{snapshot.score}% ready</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 opacity-80">
          This public-safe status page summarizes whether the admin/editor workflow has a clear direction for the day.
        </p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Active items</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.active.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">High priority</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.highPriority.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Blocked</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.blocked.length}</div>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/admin/publishing-compass" className="hgn-btn-primary">Open Publishing Compass</Link>
        <Link href="/admin/core" className="hgn-btn-dark">Back to Core</Link>
      </div>
    </main>
  );
}
