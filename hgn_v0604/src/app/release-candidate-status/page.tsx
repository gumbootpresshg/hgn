import Link from "next/link";
import { getReleaseCandidateSnapshot } from "@/lib/release-candidate";

export const dynamic = "force-dynamic";

export default async function ReleaseCandidateStatusPage() {
  const snapshot = await getReleaseCandidateSnapshot();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Release candidate status</p>
      <h1 className="mt-2 text-5xl font-black text-hgnNavy">Soft beta release check</h1>
      <p className="mt-3 max-w-3xl text-slate-700">
        A lightweight status page for deciding whether the current two-person admin/editor workflow is ready to be treated as the release candidate path.
      </p>
      <section className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">
        <div className="text-xs font-black uppercase tracking-widest text-slate-500">Release candidate score</div>
        <div className="mt-2 text-6xl font-black text-hgnNavy">{snapshot.score}%</div>
        <p className="mt-3 text-slate-700">
          Review items: {snapshot.reviewChecks.length}. Primary daily routes: {snapshot.primaryRoutes.length}. Occasional routes: {snapshot.occasionalRoutes.length}.
        </p>
        <Link href="/admin/release-candidate" className="mt-6 inline-flex hgn-btn-primary">Open release candidate desk</Link>
      </section>
    </main>
  );
}
