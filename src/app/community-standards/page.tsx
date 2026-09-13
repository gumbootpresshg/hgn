import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CommunityStandardsPage() {
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <section className="rounded-3xl bg-hgnNavy p-8 text-white md:p-12">
      <p className="text-sm font-black uppercase tracking-widest text-hgnGold">HGN beta</p>
      <h1 className="mt-3 text-5xl font-black">Community standards</h1>
      <p className="mt-4 max-w-3xl text-lg text-white/80">How Haida Gwaii News reviews reader tips, listings, letters, photos and community submissions before publishing.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/community-board" className="rounded-xl bg-white px-4 py-3 text-sm font-black text-hgnNavy">Send a submission</Link><Link href="/request-correction" className="rounded-xl border border-white/30 px-4 py-3 text-sm font-black text-white">Request a correction</Link></div>
    </section>

    <section className="mt-8 grid gap-4 md:grid-cols-3">
      <div className="hgn-card p-6"><h2 className="text-xl font-black text-hgnNavy">We verify claims</h2><p className="mt-2 text-sm leading-6 text-slate-600">News tips and public claims may be held while an editor confirms sources, dates, names and context.</p></div>
      <div className="hgn-card p-6"><h2 className="text-xl font-black text-hgnNavy">We protect people</h2><p className="mt-2 text-sm leading-6 text-slate-600">Submissions can be edited or rejected when they expose private information, target people unfairly or create avoidable harm.</p></div>
      <div className="hgn-card p-6"><h2 className="text-xl font-black text-hgnNavy">We explain decisions</h2><p className="mt-2 text-sm leading-6 text-slate-600">When possible, HGN gives submitters a clear reason if something needs edits, extra verification or cannot be published.</p></div>
    </section>

  </main>;
}
