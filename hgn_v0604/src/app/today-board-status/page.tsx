import Link from "next/link";
import { getTodayBoardSnapshot, todayBoardToneClasses, toneForTodayItem } from "@/lib/today-board";

export const dynamic = "force-dynamic";

export default async function TodayBoardStatusPage() {
  const snapshot = await getTodayBoardSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";
  const publicItems = snapshot.items.filter((item) => ["lead", "homepage", "story"].includes(String(item.item_type || ""))).slice(0, 8);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN newsroom status</p>
        <h1 className="mt-2 text-4xl font-black text-hgnNavy">Today Board Status</h1>
        <p className="mt-3 max-w-2xl text-slate-700">A lightweight internal status page for what the admin/editor team is focused on today.</p>
        <div className={`mt-6 inline-flex rounded-2xl border px-5 py-3 text-2xl font-black ${todayBoardToneClasses(scoreTone)}`}>{snapshot.score}% ready</div>
      </div>

      <section className="mt-8 grid gap-4">
        {publicItems.length ? publicItems.map((item) => (
          <article key={item.id} className={`rounded-2xl border p-5 shadow-sm ${todayBoardToneClasses(toneForTodayItem(item))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{item.item_type} · {item.status}</div>
            <h2 className="mt-2 text-2xl font-black">{item.title}</h2>
            {item.notes ? <p className="mt-2 text-sm leading-6 opacity-80">{item.notes}</p> : null}
          </article>
        )) : <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-slate-600">No public board items yet.</div>}
      </section>

      <div className="mt-8">
        <Link href="/admin/today-board" className="hgn-btn-dark">Open Today Board</Link>
      </div>
    </main>
  );
}
