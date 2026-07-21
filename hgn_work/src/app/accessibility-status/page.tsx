import Link from "next/link";
import { accessibilityTone, accessibilityToneClasses, getAccessibilitySnapshot } from "@/lib/accessibility-desk";

export const dynamic = "force-dynamic";

export default async function AccessibilityStatusPage() {
  const snapshot = await getAccessibilitySnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <section className={`rounded-3xl border p-8 ${accessibilityToneClasses(signal)}`}>
      <p className="text-sm font-black uppercase tracking-widest opacity-70">HGN Beta</p>
      <h1 className="mt-2 text-5xl font-black">Accessibility readiness status</h1>
      <p className="mt-4 max-w-3xl text-lg font-semibold opacity-80">HGN is preparing for beta with accessibility checks for navigation, article readability, forms, contrast, image descriptions and reader support.</p>
      <div className="mt-6 text-6xl font-black">{snapshot.score}%</div>
    </section>

    <section className="mt-8 grid gap-4 md:grid-cols-4">
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Checks passed</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.passedChecks.length}/{snapshot.checks.length}</div><p className="mt-2 text-sm text-slate-600">Logged accessibility checks completed.</p></div>
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Routes covered</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.routeCoverage}</div><p className="mt-2 text-sm text-slate-600">Pages with accessibility audit coverage.</p></div>
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Open fixes</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.openTasks.length}</div><p className="mt-2 text-sm text-slate-600">Remediation tasks still in progress.</p></div>
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Reader requests</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.openRequests.length}</div><p className="mt-2 text-sm text-slate-600">Accessibility requests awaiting response.</p></div>
    </section>

    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Recent accessibility checks</h2><div className="mt-4 grid gap-3">{snapshot.checks.slice(0, 8).map((item) => <article key={item.id} className={`rounded-xl border p-4 ${accessibilityToneClasses(accessibilityTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.route_path} · {item.check_area} · {item.status}</div><h3 className="mt-1 font-black">{item.requirement}</h3>{item.wcag_ref && <p className="mt-1 text-sm opacity-80">{item.wcag_ref}</p>}</article>)}</div></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">Known accessibility fixes</h2><div className="mt-4 grid gap-3">{snapshot.openTasks.slice(0, 8).map((item) => <article key={item.id} className={`rounded-xl border p-4 ${accessibilityToneClasses(accessibilityTone(item.status, item.priority))}`}><div className="text-xs font-black uppercase tracking-wide opacity-70">{item.issue_type} · {item.priority}</div><h3 className="mt-1 font-black">{item.title}</h3><p className="mt-1 text-sm opacity-80">{item.route_path || "Site-wide"}</p></article>)}{!snapshot.openTasks.length && <p className="rounded-xl bg-green-50 p-4 font-semibold text-green-900">No open accessibility remediation tasks logged.</p>}</div></div>
    </section>

    <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-hgnNavy">Need accessibility help?</h2>
      <p className="mt-2 max-w-3xl text-slate-700">If something on HGN is hard to read, navigate, hear, submit or understand, send a request and the team can triage it during beta.</p>
      <div className="mt-5 flex flex-wrap gap-3"><Link href="/accessibility-request" className="hgn-btn-primary">Send accessibility request</Link><Link href="/mobile-status" className="hgn-btn-dark">Mobile status</Link><Link href="/" className="hgn-btn-dark">Back to HGN</Link></div>
    </section>
  </main>;
}
