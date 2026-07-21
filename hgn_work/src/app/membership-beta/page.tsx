import Link from "next/link";
import { getMembershipSnapshot, membershipToneClasses } from "@/lib/membership-desk";

export const dynamic = "force-dynamic";

export default async function MembershipBetaPage() {
  const snapshot = await getMembershipSnapshot();
  const plans = snapshot.publicPlans.length ? snapshot.publicPlans : snapshot.plans.filter((plan) => plan.is_public).slice(0, 3);
  return <main className="mx-auto max-w-6xl px-4 py-12">
    <section className="rounded-3xl border bg-white p-8 shadow-sm md:p-12">
      <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">HGN Membership Beta</p>
      <h1 className="mt-3 max-w-4xl text-5xl font-black leading-tight text-hgnNavy">Help build a stronger local news network for Haida Gwaii.</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">HGN is preparing founding supporter memberships for beta. The goal is simple: help keep local reporting, community notices, emergency updates, events and island information useful, independent and sustainable.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/subscribe" className="hgn-btn-primary">Join the newsletter</Link><Link href="/support-local-news" className="hgn-btn-dark">Support local news</Link></div>
    </section>

    <section className="mt-8 grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border bg-slate-50 p-5"><div className="text-3xl font-black text-hgnNavy">{snapshot.score}%</div><p className="mt-1 text-sm font-bold text-slate-600">Membership launch readiness</p></div>
      <div className="rounded-2xl border bg-slate-50 p-5"><div className="text-3xl font-black text-hgnNavy">{snapshot.readyBenefits.length}</div><p className="mt-1 text-sm font-bold text-slate-600">Benefits being prepared</p></div>
      <div className="rounded-2xl border bg-slate-50 p-5"><div className="text-3xl font-black text-hgnNavy">{snapshot.warmProspects.length}</div><p className="mt-1 text-sm font-bold text-slate-600">Early supporter signals</p></div>
    </section>

    <section className="mt-10">
      <div className="flex items-end justify-between gap-4 border-b pb-4"><div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Beta supporter options</p><h2 className="text-3xl font-black text-hgnNavy">Founding membership draft</h2></div><Link href="/contact" className="text-sm font-black text-hgnBlue">Questions?</Link></div>
      <div className="mt-6 grid gap-5 md:grid-cols-2">{plans.map((plan) => <article key={plan.id} className={`rounded-2xl border p-6 shadow-sm ${membershipToneClasses("neutral")}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{plan.audience} · {plan.billing_period}</div><h3 className="mt-2 text-2xl font-black">{plan.title}</h3><p className="mt-2 text-4xl font-black">{plan.price_cad ? `$${plan.price_cad}` : "TBD"}<span className="text-sm font-bold opacity-70"> CAD</span></p>{plan.summary && <p className="mt-4 leading-7 opacity-80">{plan.summary}</p>}{plan.benefits && <p className="mt-4 text-sm font-semibold leading-6 opacity-80">{plan.benefits}</p>}</article>)}{!plans.length && <p className="rounded-2xl border bg-slate-50 p-6 text-slate-600">Membership plans are being drafted. Join the newsletter for the first beta invitation.</p>}</div>
    </section>

    <section className="mt-10 rounded-3xl border bg-hgnNavy p-8 text-white">
      <p className="text-sm font-black uppercase tracking-widest text-hgnGold">Why this matters</p>
      <div className="mt-4 grid gap-5 md:grid-cols-3"><div><h3 className="font-black">More local coverage</h3><p className="mt-2 text-sm leading-6 text-white/80">Support helps turn community tips, events and public-interest issues into consistent reporting.</p></div><div><h3 className="font-black">Useful island tools</h3><p className="mt-2 text-sm leading-6 text-white/80">HGN is building utilities around ferry, weather, emergency, notices, events and local resources.</p></div><div><h3 className="font-black">A sustainable newsroom</h3><p className="mt-2 text-sm leading-6 text-white/80">Membership gives the beta a path beyond ads alone while keeping the mission community-first.</p></div></div>
    </section>
  </main>;
}
