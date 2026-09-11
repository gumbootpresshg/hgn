import Link from "next/link";
import { getTrustCenterSnapshot, trustTone, trustToneClasses } from "@/lib/trust-center";

export const dynamic = "force-dynamic";

export default async function TrustPage() {
  const snapshot = await getTrustCenterSnapshot();
  const items = snapshot.publicItems.slice(0, 30);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-3xl bg-hgnNavy p-8 text-white shadow-sm">
        <p className="text-sm font-black uppercase tracking-widest text-hgnGold">HGN Trust Center</p>
        <h1 className="mt-2 text-5xl font-black">Corrections & Transparency</h1>
        <p className="mt-3 max-w-3xl text-white/80">A public log for meaningful corrections, clarifications, known beta issues and newsroom transparency notes.</p>
        <div className="mt-5 flex flex-wrap gap-2"><Link href="/request-correction" className="rounded-xl bg-white px-4 py-2 text-sm font-black text-hgnNavy">Request a correction</Link><Link href="/beta-updates" className="rounded-xl border border-white/30 px-4 py-2 text-sm font-black text-white">Beta updates</Link></div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Public notes</div><div className="mt-2 text-4xl font-black text-hgnNavy">{items.length}</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Open requests</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.openRequests.length}</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-widest text-slate-500">High priority</div><div className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.urgent.length}</div></div>
      </section>

      <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-hgnNavy">How HGN handles corrections</h2>
        <div className="mt-4 grid gap-4 text-sm leading-6 text-slate-700 md:grid-cols-3">
          <p><strong>1. Report it.</strong><br />Readers can send a correction, clarification, broken-link or missing-context request.</p>
          <p><strong>2. Triage it.</strong><br />The newsroom reviews the issue, checks the article or page, and decides whether a public note is needed.</p>
          <p><strong>3. Publish the fix.</strong><br />Meaningful corrections and transparency notes are logged here so beta readers can see what changed.</p>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        {items.map((item) => (
          <article key={item.id} className={`rounded-2xl border p-6 shadow-sm ${trustToneClasses(trustTone(item.status, item.severity))}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{item.item_type} · {item.status}{item.published_at ? ` · ${new Date(item.published_at).toLocaleDateString()}` : ""}</div>
            <h2 className="mt-2 text-2xl font-black">{item.title}</h2>
            {item.summary && <p className="mt-2 font-semibold opacity-80">{item.summary}</p>}
            {item.public_note && <p className="mt-3 whitespace-pre-wrap opacity-80">{item.public_note}</p>}
            {item.related_url && <Link href={item.related_url} className="mt-4 inline-block text-sm font-black underline">Related page</Link>}
          </article>
        ))}
        {!items.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">No public trust notes have been published yet.</p>}
      </section>
    </main>
  );
}
