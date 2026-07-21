import Link from "next/link";
import { getAudienceGrowthSnapshot } from "@/lib/audience-growth";

export const dynamic = "force-dynamic";

export default async function AudienceLabPage() {
  const snapshot = await getAudienceGrowthSnapshot();
  const publicCampaigns = snapshot.campaigns.filter((item) => ["live", "sent", "active"].includes(String(item.status || "").toLowerCase())).slice(0, 6);
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <section className="rounded-3xl bg-hgnNavy p-8 text-white shadow-lg md:p-12">
      <p className="text-sm font-black uppercase tracking-widest text-hgnGold">HGN beta audience lab</p>
      <h1 className="mt-3 text-5xl font-black">Help shape how HGN reaches readers across Haida Gwaii.</h1>
      <p className="mt-4 max-w-3xl text-lg text-white/80">During beta, HGN is testing newsletters, community channels, social updates and reader feedback loops so local stories reach the people who need them.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/newsletter" className="hgn-btn-primary">Join the newsletter</Link><Link href="/beta-join" className="rounded-xl border border-white/30 px-5 py-3 font-black text-white">Become a beta tester</Link></div>
    </section>

    <section className="mt-10 grid gap-4 md:grid-cols-3">
      {[["Newsletter first", "Get the most important local updates in a predictable reader-friendly format."], ["Community signal", "Help HGN learn which local alerts, notices and stories are most useful."], ["Beta feedback", "Tell the newsroom what feels clear, confusing, missing or worth improving."]].map(([title, body]) => <article key={title} className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">{title}</h2><p className="mt-2 text-slate-700">{body}</p></article>)}
    </section>

    <section className="mt-10 hgn-card p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Active beta campaigns</p><h2 className="mt-1 text-3xl font-black text-hgnNavy">What HGN is testing now</h2></div><p className="max-w-xl text-sm font-semibold text-slate-600">These are public-facing audience experiments and communication pushes being tested during beta.</p></div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{publicCampaigns.map((item) => <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-black uppercase tracking-wide text-slate-500">{item.channel} · {item.target_segment}</div><h3 className="mt-2 text-xl font-black text-hgnNavy">{item.title}</h3>{item.audience_goal && <p className="mt-2 text-sm font-semibold text-slate-700">Goal: {item.audience_goal}</p>}{item.call_to_action && <p className="mt-3 text-sm text-slate-700">{item.call_to_action}</p>}</article>)}{!publicCampaigns.length && <p className="rounded-2xl bg-slate-50 p-6 text-slate-600 md:col-span-2 lg:col-span-3">No public audience campaigns are live yet. Join the newsletter or beta list to help with the next test.</p>}</div>
    </section>
  </main>;
}
