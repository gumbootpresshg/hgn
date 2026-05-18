import Link from "next/link";
import { getStoryPolishSnapshot, storyPolishToneClasses } from "@/lib/story-polish";

export const dynamic = "force-dynamic";

export default async function StoryPolishStatusPage() {
  const snapshot = await getStoryPolishSnapshot();
  const tone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className={`rounded-3xl border p-8 shadow-sm ${storyPolishToneClasses(tone)}`}>
        <p className="text-sm font-black uppercase tracking-widest opacity-70">Story Polish Status</p>
        <h1 className="mt-2 text-5xl font-black">{snapshot.score}% ready</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 opacity-80">
          A simple public-safe summary of whether the next stories have had their final copy, image, SEO and homepage polish pass.
        </p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Open items</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.open.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Needs polish</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.needsPolish.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Blocked</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.blocked.length}</div>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/admin/story-polish" className="hgn-btn-primary">Open Story Polish</Link>
        <Link href="/admin/core" className="hgn-btn-dark">Back to Core</Link>
      </div>
    </main>
  );
}
