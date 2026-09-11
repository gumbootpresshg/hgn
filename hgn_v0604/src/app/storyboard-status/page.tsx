import Link from "next/link";
import { getStoryboardSnapshot, storyboardToneClasses } from "@/lib/storyboard";

export const dynamic = "force-dynamic";

export default async function StoryboardStatusPage() {
  const snapshot = await getStoryboardSnapshot();
  const tone = snapshot.score >= 80 ? "good" : snapshot.score >= 55 ? "warn" : "bad";
  return <main className="mx-auto max-w-5xl px-4 py-10">
    <div className={`rounded-3xl border p-8 ${storyboardToneClasses(tone)}`}><p className="text-sm font-black uppercase tracking-widest opacity-70">v97 Storyboard Status</p><h1 className="mt-2 text-5xl font-black">{snapshot.score}% ready</h1><p className="mt-3 max-w-2xl text-sm opacity-80">This score rewards a small board, at least one ready item and few blockers. It is designed for two-person admin/editor testing.</p><div className="mt-5 flex flex-wrap gap-2"><Link href="/admin/storyboard" className="hgn-btn-dark">Open Storyboard</Link><Link href="/admin/handoff" className="hgn-btn-primary">Handoff</Link></div></div>
    <section className="mt-8 grid gap-4 md:grid-cols-3"><div className="hgn-card p-5"><div className="text-3xl font-black text-hgnNavy">{snapshot.readyItems.length}</div><p className="text-sm font-bold text-slate-600">Ready items</p></div><div className="hgn-card p-5"><div className="text-3xl font-black text-hgnNavy">{snapshot.waitingItems.length}</div><p className="text-sm font-bold text-slate-600">Waiting or blocked</p></div><div className="hgn-card p-5"><div className="text-3xl font-black text-hgnNavy">{snapshot.activeItems.length}</div><p className="text-sm font-bold text-slate-600">Active board items</p></div></section>
  </main>;
}
