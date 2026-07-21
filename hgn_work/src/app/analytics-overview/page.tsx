import Link from "next/link";
import { analyticsToneClasses, getAnalyticsCommandSnapshot } from "@/lib/analytics-command";

export const dynamic = "force-dynamic";

export default async function AnalyticsOverviewPage() {
  const snapshot = await getAnalyticsCommandSnapshot();
  const topStories = [...snapshot.stories].sort((a, b) => Number(b.views || 0) - Number(a.views || 0)).slice(0, 6);
  const sources = [...snapshot.sources].sort((a, b) => Number(b.sessions || 0) - Number(a.sessions || 0)).slice(0, 6);
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";

  return <main className="mx-auto max-w-6xl px-4 py-10">
    <section className="rounded-3xl bg-hgnNavy p-8 text-white shadow-sm">
      <p className="text-sm font-black uppercase tracking-widest text-hgnGold">HGN Beta Analytics</p>
      <h1 className="mt-2 text-5xl font-black">Analytics Overview</h1>
      <p className="mt-4 max-w-3xl text-lg text-white/80">A simple public-facing snapshot of what HGN is watching during beta: useful stories, healthy channels and reader engagement habits.</p>
      <div className="mt-6"><Link href="/newsletter" className="rounded-xl bg-white px-4 py-3 text-sm font-black text-hgnNavy">Get updates</Link></div>
    </section>

    <section className="mt-8 grid gap-4 md:grid-cols-4">
      <div className={`rounded-2xl border p-5 ${analyticsToneClasses(signal)}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">Readiness</div><div className="mt-2 text-4xl font-black">{snapshot.score}%</div></div>
      <div className="rounded-2xl border bg-white p-5"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Views tracked</div><div className="mt-2 text-4xl font-black text-hgnNavy">{Number(snapshot.totalViews || 0).toLocaleString()}</div></div>
      <div className="rounded-2xl border bg-white p-5"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Visitors</div><div className="mt-2 text-4xl font-black text-hgnNavy">{Number(snapshot.totalVisitors || 0).toLocaleString()}</div></div>
      <div className="rounded-2xl border bg-white p-5"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Signups</div><div className="mt-2 text-4xl font-black text-hgnNavy">{Number(snapshot.totalSignups || 0).toLocaleString()}</div></div>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6">
        <h2 className="text-2xl font-black text-hgnNavy">Story signals</h2>
        <div className="mt-5 grid gap-3">
          {topStories.map((story) => <article key={story.id} className="rounded-xl border bg-slate-50 p-4">
            <div className="text-xs font-black uppercase tracking-wide text-slate-500">{story.section} · {story.status}</div>
            <h3 className="mt-1 font-black text-hgnNavy">{story.story_title}</h3>
            <p className="mt-2 text-sm font-semibold text-slate-700">{Number(story.views || 0).toLocaleString()} views · {Number(story.unique_visitors || 0).toLocaleString()} visitors</p>
          </article>)}
          {!topStories.length && <p className="text-slate-600">No story analytics have been published yet.</p>}
        </div>
      </div>
      <div className="hgn-card p-6">
        <h2 className="text-2xl font-black text-hgnNavy">Traffic channels</h2>
        <div className="mt-5 grid gap-3">
          {sources.map((source) => <article key={source.id} className="rounded-xl border bg-slate-50 p-4">
            <div className="text-xs font-black uppercase tracking-wide text-slate-500">{source.source_type} · {source.status}</div>
            <h3 className="mt-1 font-black text-hgnNavy">{source.source_name}</h3>
            <p className="mt-2 text-sm font-semibold text-slate-700">{Number(source.sessions || 0).toLocaleString()} sessions · {Number(source.signups || 0).toLocaleString()} signups</p>
          </article>)}
          {!sources.length && <p className="text-slate-600">No source summaries yet.</p>}
        </div>
      </div>
    </section>
  </main>;
}
