"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const ranges = [
  [1, "Today"],
  [7, "7 days"],
  [30, "30 days"],
  [90, "90 days"],
] as const;

function number(value: unknown) { return Number(value || 0).toLocaleString("en-CA"); }

export default function AnalyticsDashboard() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState("Loading analytics…");

  useEffect(() => {
    let active = true;
    void (async () => {
      setMessage("Loading analytics…");
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) { if (active) setMessage("Log in with a publisher account to view analytics."); return; }
      const response = await fetch(`/api/admin/analytics?days=${days}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (!active) return;
      if (!response.ok) { setData(null); setMessage(result.error || "Analytics could not be loaded."); return; }
      setData(result); setMessage("");
    })();
    return () => { active = false; };
  }, [days]);

  const totals = data?.totals || {};
  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
    <header className="flex flex-col gap-5 border-b-4 border-double border-hgnNavy pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="newspaper-kicker text-hgnBlue">Publisher intelligence</p><h1 className="mt-2 font-serif text-4xl font-bold text-hgnNavy sm:text-5xl">Audience &amp; Ad Intelligence</h1><p className="mt-3 max-w-3xl leading-7 text-slate-600">Real reader activity for editorial and advertising decisions. No billing, CRM notes, addresses or individual reader profiles are shown here.</p></div>
      <div className="flex flex-wrap gap-2">{ranges.map(([value, label]) => <button key={value} onClick={() => setDays(value)} className={`min-h-11 rounded-full px-4 text-sm font-bold ${days === value ? "bg-hgnNavy text-white" : "border bg-white text-hgnNavy hover:bg-slate-50"}`}>{label}</button>)}</div>
    </header>

    {message ? <div className="mt-7 rounded-2xl border bg-slate-50 p-5 font-semibold text-slate-700">{message}</div> : null}
    {data ? <>
      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Unique visitors" value={data.traffic.visitors === null ? "—" : number(data.traffic.visitors)} helper={data.traffic.visitors === null ? "Connect the Vercel API to show this here." : `Vercel · last ${days} days`} />
        <Metric label="Page views" value={data.traffic.pageViews === null ? "—" : number(data.traffic.pageViews)} helper={data.traffic.pageViews === null ? "Vercel is recording traffic after this release deploys." : `Vercel · last ${days} days`} />
        <Metric label="Article reads" value={number(totals.articleViews)} helper="HGN article-view events" />
        <Metric label="Newsletter signups" value={number(totals.newsletterSignups)} helper="Completed HGN signup events" />
      </section>

      {data.traffic.error ? <section className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm leading-6 text-slate-700"><strong className="text-hgnNavy">Vercel traffic connection:</strong> {data.traffic.error} General page traffic will still appear in Vercel once Web Analytics is enabled and this release is deployed. Add the optional server-only Vercel credentials to display visitor and page-view totals here as well.</section> : null}

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div className="hgn-card p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="newspaper-kicker text-hgnBlue">Editorial</p><h2 className="mt-1 font-serif text-3xl font-bold text-hgnNavy">Most-read articles</h2></div><Link href="/articles" className="font-bold text-hgnBlue underline underline-offset-4">Open articles</Link></div><div className="mt-5 divide-y">{data.topArticles.length ? data.topArticles.map((item: any, index: number) => <article key={item.slug} className="grid grid-cols-[2.2rem_1fr_auto] gap-3 py-4"><span className="font-serif text-2xl font-bold text-stone-400">{index + 1}</span><div><p className="text-xs font-bold uppercase tracking-wide text-hgnBlue">{item.article?.category || "Article"}</p><Link href={`/articles/${item.slug}`} className="mt-1 block font-serif text-xl font-bold leading-snug text-hgnNavy hover:underline">{item.article?.title || item.slug}</Link><p className="mt-1 text-xs text-slate-500">{item.slug}</p></div><strong className="self-center text-right text-lg text-hgnNavy">{number(item.views)}<span className="block text-[10px] uppercase tracking-wide text-slate-500">reads</span></strong></article>) : <p className="rounded-xl bg-slate-50 p-5 text-slate-600">No article reading activity has been recorded in this period yet.</p>}</div></div>
        <div className="hgn-card p-5 sm:p-7"><p className="newspaper-kicker text-hgnBlue">Reader actions</p><h2 className="mt-1 font-serif text-3xl font-bold text-hgnNavy">What readers did</h2><div className="mt-5 grid gap-3">{data.actions.length ? data.actions.map((item: any) => <div key={item.eventType} className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3"><span className="font-bold text-slate-700">{item.eventType.replaceAll("_", " ")}</span><strong className="text-xl text-hgnNavy">{number(item.count)}</strong></div>) : <p className="rounded-xl bg-slate-50 p-5 text-slate-600">Reader actions will appear after this release is live.</p>}</div><a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="mt-6 inline-flex font-bold text-hgnBlue underline underline-offset-4">Open Vercel Analytics ↗</a></div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="hgn-card overflow-hidden"><div className="p-5 sm:p-7"><p className="newspaper-kicker text-hgnBlue">Advertising</p><h2 className="mt-1 font-serif text-3xl font-bold text-hgnNavy">Ad performance</h2><p className="mt-2 text-sm leading-6 text-slate-600">Impressions are recorded only after an ad is at least half visible for about one second. CTR is shown only when an ad has impressions.</p></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-y bg-stone-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Campaign</th><th className="px-5 py-3">Placement</th><th className="px-5 py-3 text-right">Impressions</th><th className="px-5 py-3 text-right">Clicks</th><th className="px-5 py-3 text-right">CTR</th></tr></thead><tbody>{data.adPerformance.length ? data.adPerformance.map((item: any) => <tr key={item.id} className="border-b"><td className="px-5 py-4"><strong className="block text-hgnNavy">{item.ad?.title || "Archived/unknown ad"}</strong><span className="text-slate-500">{item.ad?.advertiser_name || item.id}</span></td><td className="px-5 py-4 text-slate-600">{item.ad?.placement_key || "—"}</td><td className="px-5 py-4 text-right font-bold">{number(item.impressions)}</td><td className="px-5 py-4 text-right font-bold">{number(item.clicks)}</td><td className="px-5 py-4 text-right font-bold">{item.ctr === null ? "—" : `${item.ctr}%`}</td></tr>) : <tr><td className="px-5 py-7 text-slate-600" colSpan={5}>No live ad impressions or clicks have been recorded in this period.</td></tr>}</tbody></table></div></div>
        <div className="hgn-card p-5 sm:p-7"><p className="newspaper-kicker text-hgnBlue">On-site activity</p><h2 className="mt-1 font-serif text-3xl font-bold text-hgnNavy">Most active pages</h2><div className="mt-5 divide-y">{data.topPages.length ? data.topPages.map((item: any) => <div key={item.path} className="flex items-center justify-between gap-4 py-3"><code className="min-w-0 break-all text-sm text-slate-700">{item.path}</code><strong className="shrink-0 text-hgnNavy">{number(item.events)}</strong></div>) : <p className="rounded-xl bg-slate-50 p-5 text-slate-600">Page-level activity will appear after readers visit the updated site.</p>}</div></div>
      </section>
    </> : null}
  </main>;
}

function Metric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">{label}</p><strong className="mt-3 block font-serif text-4xl text-hgnNavy">{value}</strong><p className="mt-2 text-sm leading-5 text-slate-600">{helper}</p></div>;
}
