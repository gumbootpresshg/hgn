import Link from "next/link";
import { getNewsflowSnapshot, newsflowToneClasses } from "@/lib/newsflow-board";

export const dynamic = "force-dynamic";

export default async function NewsflowStatusPage() {
  const snapshot = await getNewsflowSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className={`rounded-3xl border p-8 shadow-sm ${newsflowToneClasses(scoreTone)}`}>
        <p className="text-sm font-black uppercase tracking-widest opacity-70">HGN v108</p>
        <h1 className="mt-2 text-5xl font-black">Newsflow Status</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 opacity-80">
          A simple public-safe status snapshot for the admin/editor beta workflow. It shows whether the day has a clear publishing rhythm without exposing private notes.
        </p>
        <div className="mt-6 text-6xl font-black">{snapshot.score}%</div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/admin/newsflow-board" className="hgn-btn-dark">Open Newsflow Board</Link>
          <Link href="/admin/core" className="hgn-btn-primary">Core Dashboard</Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Open</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.open.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Active</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.active.length}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Urgent</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.urgent.length}</div>
        </div>
      </section>
    </main>
  );
}
