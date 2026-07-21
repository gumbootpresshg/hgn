import Link from "next/link";
import { copyDeskTone, copyDeskToneClasses, getCopyDeskSnapshot } from "@/lib/copy-desk";

export const dynamic = "force-dynamic";

export default async function CopyStatusPage() {
  const snapshot = await getCopyDeskSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 50 ? "warn" : "bad";
  return <main className="mx-auto max-w-5xl px-4 py-10">
    <div className="border-b pb-6"><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN Internal</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Copy Status</h1><p className="mt-3 max-w-3xl text-slate-700">A simple status page for final article polish during the two-person beta.</p><Link href="/admin/copy-desk" className="mt-4 inline-flex hgn-btn-primary">Open copy desk</Link></div>
    <section className={`mt-8 rounded-3xl border p-8 ${copyDeskToneClasses(signal)}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">Copy readiness</div><div className="mt-2 text-6xl font-black">{snapshot.score}%</div><p className="mt-3 text-sm opacity-80">This rewards zero publish blockers, a short fix queue, and a useful final-pass checklist.</p></section>
    <section className="mt-8 grid gap-4 md:grid-cols-3"><div className="hgn-card p-5"><div className="text-sm font-black uppercase tracking-widest text-slate-500">Blockers</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.blockers.length}</div></div><div className="hgn-card p-5"><div className="text-sm font-black uppercase tracking-widest text-slate-500">Active items</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.activeItems.length}</div></div><div className="hgn-card p-5"><div className="text-sm font-black uppercase tracking-widest text-slate-500">Required checks</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.requiredChecks.length}</div></div></section>
    <section className="mt-8 hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Open copy items</h2><div className="mt-4 grid gap-3">{snapshot.activeItems.slice(0, 10).map((item) => <article key={item.id} className={`rounded-xl border p-4 ${copyDeskToneClasses(copyDeskTone(item.status, item.priority, item.publish_blocker))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.article_title}</h3>{item.issue_summary && <p className="mt-2 text-sm opacity-80">{item.issue_summary}</p>}</article>)}</div></section>
  </main>;
}
