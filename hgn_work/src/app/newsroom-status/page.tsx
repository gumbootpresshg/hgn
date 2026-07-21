import Link from "next/link";
import { getNewsroomStreamlineSnapshot, newsroomTone, newsroomToneClasses } from "@/lib/newsroom-streamline";

export const dynamic = "force-dynamic";

export default async function NewsroomStatusPage() {
  const snapshot = await getNewsroomStreamlineSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 50 ? "warn" : "bad";
  return <main className="mx-auto max-w-5xl px-4 py-10">
    <div className="border-b pb-6"><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN Beta</p><h1 className="mt-2 text-5xl font-black text-hgnNavy">Newsroom Status</h1><p className="mt-3 max-w-3xl text-slate-700">A lightweight internal-facing summary for the current two-person beta workflow.</p><Link href="/admin/newsroom" className="mt-4 inline-flex hgn-btn-primary">Open newsroom</Link></div>
    <section className={`mt-8 rounded-3xl border p-8 ${newsroomToneClasses(signal)}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">Current flow score</div><div className="mt-2 text-6xl font-black">{snapshot.score}%</div><p className="mt-3 text-sm opacity-80">This score rewards a small queue, filled homepage slots, and fewer items needing attention.</p></section>
    <section className="mt-8 grid gap-4 md:grid-cols-3"><div className="hgn-card p-5"><div className="text-sm font-black uppercase tracking-widest text-slate-500">Needs attention</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.needsAttention.length}</div></div><div className="hgn-card p-5"><div className="text-sm font-black uppercase tracking-widest text-slate-500">Publish today</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.publishToday.length}</div></div><div className="hgn-card p-5"><div className="text-sm font-black uppercase tracking-widest text-slate-500">Homepage ready</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.homepageReady.length}</div></div></section>
    <section className="mt-8 hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Current queue</h2><div className="mt-4 grid gap-3">{snapshot.queue.slice(0, 8).map((item) => <article key={item.id} className={`rounded-xl border p-4 ${newsroomToneClasses(newsroomTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.queue_area} · {item.priority} · {item.status}</div><h3 className="mt-1 font-black">{item.title}</h3>{item.next_step && <p className="mt-2 text-sm opacity-80">Next: {item.next_step}</p>}</article>)}</div></section>
  </main>;
}
