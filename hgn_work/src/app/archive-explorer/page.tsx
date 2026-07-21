import Link from "next/link";
import { archiveTone, archiveToneClasses, getArchiveIntelligenceSnapshot } from "@/lib/archive-intelligence";

export const dynamic = "force-dynamic";

export default async function ArchiveExplorerPage() {
  const snapshot = await getArchiveIntelligenceSnapshot();
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <section className="rounded-3xl bg-hgnNavy p-8 text-white shadow-sm">
      <p className="text-sm font-black uppercase tracking-widest text-hgnGold">HGN archive beta</p>
      <h1 className="mt-3 text-5xl font-black">Archive Explorer</h1>
      <p className="mt-4 max-w-3xl text-lg text-white/80">A public-facing beta view for HGN’s growing local memory system: historical topics, explainers, evergreen stories and searchable community context.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/archive" className="rounded-xl bg-white px-5 py-3 font-black text-hgnNavy">Browse archive</Link><Link href="/admin/archive-intelligence" className="rounded-xl border border-white/30 px-5 py-3 font-black text-white">Admin desk</Link></div>
    </section>

    <section className="mt-8 grid gap-4 md:grid-cols-3">
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Topics</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.activeTopics.length}</div><p className="mt-2 text-sm text-slate-600">Active archive themes.</p></div>
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Evergreen</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.openQueue.length}</div><p className="mt-2 text-sm text-slate-600">Stories ready to resurface.</p></div>
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Health</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.score}%</div><p className="mt-2 text-sm text-slate-600">Archive readiness score.</p></div>
    </section>

    <section className="mt-8">
      <h2 className="text-3xl font-black text-hgnNavy">Explore by topic</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{snapshot.topics.map((topic) => <article key={topic.id} className={`rounded-2xl border p-5 shadow-sm ${archiveToneClasses(archiveTone(topic.status, topic.priority))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{topic.era_label || "ongoing"} · {topic.coverage_area || "Haida Gwaii"}</div><h3 className="mt-2 text-2xl font-black">{topic.topic_name}</h3>{topic.description && <p className="mt-2 text-sm font-semibold opacity-80">{topic.description}</p>}<p className="mt-3 text-xs font-black uppercase tracking-widest opacity-60">Status: {topic.status}</p></article>)}{!snapshot.topics.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">Archive topics will appear here once the newsroom creates them.</p>}</div>
    </section>

    <section className="mt-8">
      <h2 className="text-3xl font-black text-hgnNavy">Evergreen stories to watch</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{snapshot.queue.slice(0, 6).map((item) => <article key={item.id} className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-widest text-hgnBlue">{item.suggested_channel} · {item.status}</div><h3 className="mt-2 text-xl font-black text-hgnNavy">{item.headline}</h3><p className="mt-2 text-sm text-slate-600">{[item.topic_name, item.publish_window, item.target_date].filter(Boolean).join(" · ") || "Timing not set"}</p>{item.reason && <p className="mt-2 text-sm text-slate-700">{item.reason}</p>}</article>)}</div>
    </section>
  </main>;
}
