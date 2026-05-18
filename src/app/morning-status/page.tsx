import Link from "next/link";
import { getMorningDeskSnapshot, morningToneClasses } from "@/lib/morning-desk";

export const dynamic = "force-dynamic";

export default async function MorningStatusPage() {
  const snapshot = await getMorningDeskSnapshot();
  const scoreTone = snapshot.score >= 82 ? "good" : snapshot.score >= 60 ? "warn" : "bad";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Morning status</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Today&apos;s start</h1>
          <p className="mt-3 max-w-2xl text-slate-700">A quick public-safe view of whether the HGN day has a lead, a homepage plan and any obvious blockers.</p>
        </div>
        <Link href="/admin/morning-desk" className="hgn-btn-primary">Open Morning Desk</Link>
      </div>

      <section className={`mt-8 rounded-3xl border p-8 shadow-sm ${morningToneClasses(scoreTone)}`}>
        <p className="text-xs font-black uppercase tracking-widest opacity-70">Morning readiness</p>
        <div className="mt-2 text-6xl font-black">{snapshot.score}%</div>
        <p className="mt-3 text-sm leading-6 opacity-80">
          {snapshot.blockers.length ? "There are blockers to clear before the day feels ready." : "No blockers are currently flagged in the morning desk."}
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="hgn-card p-5">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Open</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.open.length}</div>
        </div>
        <div className="hgn-card p-5">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Ready</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.ready.length}</div>
        </div>
        <div className="hgn-card p-5">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</div>
          <div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.blockers.length}</div>
        </div>
      </section>

      <section className="mt-8 hgn-card p-6">
        <h2 className="text-2xl font-black text-hgnNavy">Morning focus</h2>
        <div className="mt-4 grid gap-3">
          {snapshot.items.slice(0, 6).map((item) => (
            <div key={item.id} className="rounded-xl border bg-slate-50 p-4">
              <div className="text-xs font-black uppercase tracking-widest text-slate-500">{item.lane} · {item.item_status}</div>
              <h3 className="mt-1 font-black text-hgnNavy">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
