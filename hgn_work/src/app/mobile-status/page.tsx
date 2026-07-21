import Link from "next/link";
import { getMobileQaSnapshot, mobileTone, mobileToneClasses } from "@/lib/mobile-qa";

export const dynamic = "force-dynamic";

export default async function MobileStatusPage() {
  const snapshot = await getMobileQaSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <section className={`rounded-3xl border p-8 ${mobileToneClasses(signal)}`}>
      <p className="text-sm font-black uppercase tracking-widest opacity-70">HGN Beta</p>
      <h1 className="mt-2 text-5xl font-black">Mobile readiness status</h1>
      <p className="mt-4 max-w-3xl text-lg font-semibold opacity-80">Most readers will experience HGN on a phone. This beta status page summarizes mobile QA coverage, known blockers and performance checks.</p>
      <div className="mt-6 text-6xl font-black">{snapshot.score}%</div>
    </section>

    <section className="mt-8 grid gap-4 md:grid-cols-3">
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Device tests</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.passedTests.length}/{snapshot.tests.length}</div><p className="mt-2 text-sm text-slate-600">Passed checks across phone/tablet routes.</p></div>
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Open blockers</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.openBlockers.length}</div><p className="mt-2 text-sm text-slate-600">Issues still being reviewed before wider beta.</p></div>
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Lighthouse avg</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.scoreAverage || "—"}</div><p className="mt-2 text-sm text-slate-600">Average from logged mobile Lighthouse runs.</p></div>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Recent mobile checks</h2><div className="mt-4 grid gap-3">{snapshot.tests.slice(0, 8).map((item) => <article key={item.id} className={`rounded-xl border p-4 ${mobileToneClasses(mobileTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.route_path} · {item.browser} · {item.status}</div><h3 className="mt-1 font-black">{item.device_name}</h3>{item.notes && <p className="mt-2 text-sm opacity-80">{item.notes}</p>}</article>)}</div></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Known beta blockers</h2><div className="mt-4 grid gap-3">{snapshot.openBlockers.slice(0, 8).map((item) => <article key={item.id} className={`rounded-xl border p-4 ${mobileToneClasses(mobileTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.area} · {item.priority}</div><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-1 text-sm opacity-80">{item.route_path || "Site-wide"}</p></article>)}{!snapshot.openBlockers.length && <p className="rounded-xl bg-green-50 p-4 font-semibold text-green-900">No open mobile blockers logged.</p>}</div></div>
    </section>

    <div className="mt-8 flex flex-wrap gap-3"><Link href="/beta-status" className="hgn-btn-dark">Beta status</Link><Link href="/" className="hgn-btn-primary">Back to HGN</Link></div>
  </main>;
}
