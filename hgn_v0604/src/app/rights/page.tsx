import Link from "next/link";
import { getRightsDeskSnapshot, rightsToneClasses } from "@/lib/rights-desk";

export const dynamic = "force-dynamic";

export default async function RightsPage() {
  const snapshot = await getRightsDeskSnapshot();
  const signal = snapshot.score >= 75 ? "good" : snapshot.score >= 45 ? "warn" : "bad";
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <section className={`rounded-3xl border p-8 ${rightsToneClasses(signal)}`}>
      <p className="text-sm font-black uppercase tracking-widest opacity-70">HGN Beta</p>
      <h1 className="mt-2 text-5xl font-black">Rights, credits and takedown requests</h1>
      <p className="mt-4 max-w-3xl text-lg font-semibold opacity-80">HGN is preparing a clear rights workflow for photos, supplied media, community submissions and content takedown requests before beta opens wider.</p>
      <div className="mt-6 text-6xl font-black">{snapshot.score}%</div>
    </section>

    <section className="mt-8 grid gap-4 md:grid-cols-4">
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Cleared assets</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.clearedAssets.length}</div><p className="mt-2 text-sm text-slate-600">Media assets marked licensed or cleared.</p></div>
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Needs review</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.needsReviewAssets.length}</div><p className="mt-2 text-sm text-slate-600">Assets still missing rights confirmation.</p></div>
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Open releases</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.openReleases.length}</div><p className="mt-2 text-sm text-slate-600">Consent or release forms still pending.</p></div>
      <div className="hgn-card p-5"><div className="text-xs font-black uppercase tracking-wide text-slate-500">Open claims</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.openTakedowns.length}</div><p className="mt-2 text-sm text-slate-600">Rights/takedown claims being reviewed.</p></div>
    </section>

    <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-hgnNavy">How HGN is handling rights during beta</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-slate-50 p-5"><h3 className="font-black text-hgnNavy">Credits and licenses</h3><p className="mt-2 text-sm leading-6 text-slate-700">Photos, graphics and supplied media should have a source, credit line and usage scope before being promoted widely.</p></div>
        <div className="rounded-2xl border bg-slate-50 p-5"><h3 className="font-black text-hgnNavy">Release forms</h3><p className="mt-2 text-sm leading-6 text-slate-700">Sensitive photos, minors, supplied portraits and community-event images can be tracked with release status and storage links.</p></div>
        <div className="rounded-2xl border bg-slate-50 p-5"><h3 className="font-black text-hgnNavy">Takedown review</h3><p className="mt-2 text-sm leading-6 text-slate-700">Rights concerns can be logged, prioritized and resolved through the admin Rights Desk.</p></div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/policies" className="hgn-btn-primary">Policies</Link><Link href="/trust" className="hgn-btn-dark">Trust centre</Link><Link href="/request-correction" className="hgn-btn-dark">Request correction</Link></div>
    </section>

    <section className="mt-8 grid gap-4 md:grid-cols-2">
      {snapshot.assets.slice(0, 6).map((item) => <article key={item.id} className="rounded-2xl border bg-white p-6 shadow-sm"><div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{item.asset_type} · {item.license_status}</div><h2 className="mt-2 text-2xl font-black text-hgnNavy">{item.title}</h2>{item.credit_line && <p className="mt-3 text-slate-700">Credit: {item.credit_line}</p>}{item.usage_scope && <p className="mt-1 text-sm font-semibold text-slate-600">Usage: {item.usage_scope}</p>}</article>)}
    </section>
  </main>;
}
