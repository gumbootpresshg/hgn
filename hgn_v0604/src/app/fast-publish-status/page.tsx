import Link from "next/link";
import { fastPublishTone, fastPublishToneClasses, getFastPublishSnapshot } from "@/lib/fast-publish";

export const dynamic = "force-dynamic";

export default async function FastPublishStatusPage() {
  const snapshot = await getFastPublishSnapshot();
  const tone = snapshot.score >= 75 ? "good" : snapshot.score >= 50 ? "warn" : "bad";
  return <main className="mx-auto max-w-5xl px-4 py-10">
    <div className={`rounded-3xl border p-8 shadow-sm ${fastPublishToneClasses(tone)}`}>
      <p className="text-sm font-black uppercase tracking-widest opacity-70">HGN v93</p>
      <h1 className="mt-2 text-5xl font-black">Fast Publish Status</h1>
      <p className="mt-3 max-w-2xl text-lg opacity-80">Internal-facing snapshot for the admin/editor beta workflow. This is about getting today&apos;s work live without unnecessary dashboard hopping.</p>
      <div className="mt-6 text-6xl font-black">{snapshot.score}%</div>
      <Link href="/admin/fast-publish" className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white">Open Fast Publish</Link>
    </div>

    <section className="mt-8 grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Ready now</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.readyQueue.length}</div></div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Needs basics</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.missingBasics.length}</div></div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Open actions</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.openActions.length}</div></div>
    </section>

    <section className="mt-8 grid gap-4">
      <h2 className="text-2xl font-black text-hgnNavy">Current lane</h2>
      {snapshot.openQueue.length ? snapshot.openQueue.slice(0, 10).map((item) => <article key={item.id} className={`rounded-2xl border p-5 ${fastPublishToneClasses(fastPublishTone(item.queue_status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.priority} · {item.queue_status}</div><h3 className="mt-1 text-xl font-black">{item.story_title}</h3><p className="mt-1 text-sm opacity-80">{item.article_slug || "No slug yet"}</p></article>) : <div className="rounded-2xl border border-dashed bg-slate-50 p-5 text-slate-600">No active fast-publish items.</div>}
    </section>
  </main>;
}
