import Link from "next/link";
import { getRevenueReadinessSnapshot } from "@/lib/revenue-readiness";

export const dynamic = "force-dynamic";

export default async function MediaKitBetaPage() {
  const snapshot = await getRevenueReadinessSnapshot();
  const packages = snapshot.packages.filter((item) => ["ready", "active", "approved"].includes(String(item.status || "").toLowerCase()));
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <section className="rounded-3xl bg-hgnNavy p-8 text-white shadow-lg md:p-12">
      <p className="text-sm font-black uppercase tracking-widest text-hgnGold">HGN beta advertiser kit</p>
      <h1 className="mt-3 text-5xl font-black">Reach readers across Haida Gwaii as HGN enters beta.</h1>
      <p className="mt-4 max-w-3xl text-lg text-white/80">This beta media kit gives local businesses and community sponsors a simple way to support independent local news while HGN tests launch advertising placements.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/advertise" className="hgn-btn-primary">Advertise with HGN</Link><Link href="/contact" className="rounded-xl border border-white/30 px-5 py-3 font-black text-white">Contact the team</Link></div>
    </section>

    <section className="mt-10 grid gap-4 md:grid-cols-3">
      {["Local readers", "Community trust", "Beta pricing"].map((title, index) => <article key={title} className="hgn-card p-6"><div className="text-4xl font-black text-hgnRed">0{index + 1}</div><h2 className="mt-2 text-2xl font-black text-hgnNavy">{title}</h2><p className="mt-2 text-slate-700">{index === 0 ? "Put your message beside local stories, notices, guides and daily information readers already need." : index === 1 ? "Support a platform being built for Haida Gwaii with correction, transparency and reader feedback workflows." : "Start with controlled beta placements before HGN opens a larger public ad program."}</p></article>)}
    </section>

    <section className="mt-10 hgn-card p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Available packages</p><h2 className="mt-1 text-3xl font-black text-hgnNavy">Beta sponsor placements</h2></div><p className="max-w-xl text-sm font-semibold text-slate-600">Final availability may change during beta as HGN tests layout, performance and reader experience.</p></div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{packages.map((item) => <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-wide text-slate-500">{item.placement} · {item.billing_period}</div><h3 className="mt-2 text-xl font-black text-hgnNavy">{item.title}</h3><p className="mt-2 text-3xl font-black text-hgnRed">{item.price_cad ? `$${item.price_cad}` : "TBD"}</p>{item.summary && <p className="mt-3 text-sm text-slate-700">{item.summary}</p>}</article>)}{!packages.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600 md:col-span-2 lg:col-span-3">Beta sponsor packages are being finalized. Check back soon or contact HGN for early availability.</p>}</div>
    </section>

    <section className="mt-10 rounded-3xl border bg-slate-50 p-8"><h2 className="text-3xl font-black text-hgnNavy">Good-fit beta sponsors</h2><p className="mt-3 max-w-3xl text-slate-700">Local shops, services, tourism operators, community organizations, trades, arts groups, restaurants, accommodations and civic partners who want visibility while supporting local news.</p></section>
  </main>;
}
