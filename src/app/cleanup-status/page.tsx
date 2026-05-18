import Link from "next/link";
import { cleanupToneClasses, getCleanupDeskSnapshot } from "@/lib/cleanup-desk";

export const dynamic = "force-dynamic";

export default async function CleanupStatusPage() {
  const snapshot = await getCleanupDeskSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Cleanup Status</p>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">{snapshot.score}% ready</h1>
        <p className="mt-3 max-w-2xl text-slate-700">A lightweight signal for whether the admin/editor beta workspace has loose ends that could slow down publishing.</p>
        <div className={`mt-6 rounded-2xl border p-5 ${cleanupToneClasses(scoreTone)}`}>
          <p className="text-sm font-black uppercase tracking-widest opacity-70">Current signal</p>
          <p className="mt-2 text-2xl font-black">{snapshot.blocked.length ? "Blocked cleanup items need attention" : snapshot.review.length ? "Some items need review" : "Workspace is clear enough to keep publishing"}</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-5"><div className="text-3xl font-black">{snapshot.active.length}</div><p className="text-sm text-slate-600">Active cleanup items</p></div>
          <div className="rounded-2xl border p-5"><div className="text-3xl font-black">{snapshot.review.length}</div><p className="text-sm text-slate-600">Need review</p></div>
          <div className="rounded-2xl border p-5"><div className="text-3xl font-black">{snapshot.blocked.length}</div><p className="text-sm text-slate-600">Blocked</p></div>
        </div>
        <Link href="/admin/cleanup-desk" className="mt-6 inline-flex hgn-btn-primary">Open Cleanup Desk</Link>
      </div>
    </main>
  );
}
