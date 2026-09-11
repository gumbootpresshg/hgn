import Link from "next/link";
import { briefTone, briefToneClasses, getPublishBriefSnapshot } from "@/lib/publish-brief";

export const dynamic = "force-dynamic";

export default async function PublishBriefStatusPage() {
  const snapshot = await getPublishBriefSnapshot();
  const publicItems = snapshot.items.filter((item) => !["dropped"].includes(String(item.status || "").toLowerCase())).slice(0, 12);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-3xl bg-hgnNavy p-8 text-white">
        <p className="text-sm font-black uppercase tracking-widest text-white/70">HGN Status</p>
        <h1 className="mt-2 text-4xl font-black">Publish Brief Status</h1>
        <p className="mt-3 max-w-2xl text-white/80">
          A lightweight internal-facing status page for the daily admin/editor publish plan.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/admin/publish-brief" className="rounded-xl bg-white px-4 py-2 text-sm font-black text-hgnNavy">Open admin brief</Link>
          <Link href="/storyboard-status" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white">Storyboard status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Readiness</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.score}%</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.blockers.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Open items</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.activeItems.length}</div>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {publicItems.length ? publicItems.map((item) => (
          <article key={item.id} className={`rounded-2xl border p-5 ${briefToneClasses(briefTone(item.status, item.is_blocking))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{item.task_type} · {item.status}</div>
            <h2 className="mt-1 text-2xl font-black">{item.task_title}</h2>
            {item.related_story && <p className="mt-2 text-sm font-bold opacity-80">{item.related_story}</p>}
            {item.is_blocking && <p className="mt-3 text-xs font-black uppercase tracking-widest text-rose-700">Needs attention before publish</p>}
          </article>
        )) : (
          <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-slate-600">No publish brief items yet.</div>
        )}
      </section>
    </main>
  );
}
