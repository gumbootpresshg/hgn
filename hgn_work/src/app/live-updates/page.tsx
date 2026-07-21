import Link from "next/link";
import { getLiveDeskSnapshot, liveDeskTone, liveDeskToneClasses } from "@/lib/live-desk";

export const dynamic = "force-dynamic";

export default async function LiveUpdatesPage() {
  const snapshot = await getLiveDeskSnapshot();
  const published = snapshot.updates.filter((update) => String(update.status || "").toLowerCase() === "published");
  const activeStories = snapshot.openStories.filter((story) => story.pinned || ["live", "urgent", "watching"].includes(String(story.status || "").toLowerCase()));

  return <main className="mx-auto max-w-5xl px-4 py-10">
    <div className="border-b pb-6">
      <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN Live Updates</p>
      <h1 className="mt-2 text-5xl font-black text-hgnNavy">Live Updates</h1>
      <p className="mt-3 max-w-3xl text-slate-700">Current rolling updates and status notes from HGN. This page is meant for active local situations, urgent information and quick follow-ups.</p>
      <div className="mt-4"><Link href="/" className="hgn-btn-dark">Back to homepage</Link></div>
    </div>

    <section className="mt-8 grid gap-4">{activeStories.length ? activeStories.map((story) => <article key={story.id} className={`rounded-2xl border p-5 shadow-sm ${liveDeskToneClasses(liveDeskTone(story.status, story.priority, story.pinned))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{story.status} · {story.priority}</div><h2 className="mt-1 text-2xl font-black">{story.story_title}</h2>{story.banner_text && <p className="mt-3 rounded-xl bg-white/70 p-3 text-sm font-bold">{story.banner_text}</p>}{story.notes && <p className="mt-3 text-sm opacity-80">{story.notes}</p>}</article>) : <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-slate-600">No active live stories right now.</div>}</section>

    <section className="mt-10"><h2 className="text-3xl font-black text-hgnNavy">Latest posted updates</h2><div className="mt-4 grid gap-4">{published.length ? published.map((update) => <article key={update.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Published update</div><h3 className="mt-1 text-xl font-black text-hgnNavy">{update.update_title}</h3>{update.update_body && <p className="mt-3 text-slate-700">{update.update_body}</p>}{update.source_note && <p className="mt-3 text-xs font-bold text-slate-500">Source note: {update.source_note}</p>}</article>) : <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-slate-600">No posted live updates yet.</div>}</div></section>
  </main>;
}
