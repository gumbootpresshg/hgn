import Link from "next/link";
import { getPolicyDeskSnapshot, policyToneClasses } from "@/lib/policy-desk";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const snapshot = await getPolicyDeskSnapshot();
  const publicDocs = snapshot.documents.filter((item) => ["published", "approved"].includes(String(item.status || "").toLowerCase()));
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <section className={`rounded-3xl border p-8 ${policyToneClasses(signal)}`}>
      <p className="text-sm font-black uppercase tracking-widest opacity-70">HGN Beta</p>
      <h1 className="mt-2 text-5xl font-black">Policies and reader commitments</h1>
      <p className="mt-4 max-w-3xl text-lg font-semibold opacity-80">This page collects the public policies HGN is preparing for beta, including privacy, corrections, submissions, advertising and community standards.</p>
      <div className="mt-6 text-6xl font-black">{snapshot.score}%</div>
    </section>

    <section className="mt-8 grid gap-4 md:grid-cols-3">
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Public docs</div><div className="mt-2 text-4xl font-black text-hgnNavy">{publicDocs.length}</div><p className="mt-2 text-sm text-slate-600">Approved or published beta policies.</p></div>
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Review tasks</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.openTasks.length}</div><p className="mt-2 text-sm text-slate-600">Policy items still being reviewed.</p></div>
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Open risks</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.openRisks.length}</div><p className="mt-2 text-sm text-slate-600">Launch risks being tracked internally.</p></div>
    </section>

    <section className="mt-8 grid gap-4 md:grid-cols-2">
      {publicDocs.map((item) => <article key={item.id} className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{item.policy_type} · {item.status}</div>
        <h2 className="mt-2 text-2xl font-black text-hgnNavy">{item.title}</h2>
        {item.summary && <p className="mt-3 text-slate-700">{item.summary}</p>}
        {item.public_url && <p className="mt-4 text-sm font-black text-slate-600">Path: {item.public_url}</p>}
      </article>)}
      {!publicDocs.length && <div className="rounded-2xl border bg-amber-50 p-6 font-semibold text-amber-900">No public policy documents are marked approved or published yet.</div>}
    </section>

    <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-hgnNavy">Related reader help</h2>
      <p className="mt-2 max-w-3xl text-slate-700">During beta, HGN is also tracking corrections, accessibility requests, community submissions and trust notes.</p>
      <div className="mt-5 flex flex-wrap gap-3"><Link href="/trust" className="hgn-btn-primary">Trust centre</Link><Link href="/request-correction" className="hgn-btn-dark">Request a correction</Link><Link href="/accessibility-request" className="hgn-btn-dark">Accessibility request</Link></div>
    </section>
  </main>;
}
