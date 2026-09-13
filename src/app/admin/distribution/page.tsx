import Link from "next/link";
import DistributionTestButton from "@/components/admin/DistributionTestButton";
import { supabase } from "@/lib/supabase";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

function Status({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return <div className="rounded-2xl border bg-white p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-serif text-xl font-black">{label}</h3><p className="mt-1 text-sm leading-6 text-stone-600">{detail}</p></div><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${ok ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>{ok ? "READY" : "SETUP"}</span></div></div>;
}

export default async function DistributionPage() {
  const { data: latest } = await supabase.from("articles").select("title,slug,published_at,status").eq("status","published").not("slug","is",null).order("published_at",{ascending:false}).limit(1).maybeSingle();
  const latestUrl = latest?.slug ? absoluteUrl(`/articles/${latest.slug}`) : absoluteUrl("/");
  const googleVerified = Boolean(process.env.GOOGLE_SITE_VERIFICATION);
  const bingVerified = Boolean(process.env.BING_SITE_VERIFICATION);
  const indexNow = Boolean(process.env.INDEXNOW_KEY);
  return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <section className="border-b-4 border-double border-black pb-7"><p className="text-sm font-black uppercase tracking-[0.18em]">Publisher tools</p><h1 className="mt-2 font-serif text-5xl font-black">News Distribution</h1><p className="mt-3 max-w-3xl text-lg leading-8 text-stone-600">One place to check whether HGN is giving search engines, news aggregators and feed readers the signals they need. Publishing stays editorial. The plumbing stays automatic.</p></section>
    <section className="mt-8 grid gap-4 md:grid-cols-2">
      <Status ok label="Google News sitemap" detail="Recent published stories are exposed through /news-sitemap.xml." />
      <Status ok label="Search sitemap" detail="Published articles and key public routes are exposed through /sitemap.xml." />
      <Status ok label="NewsArticle schema" detail="Articles publish structured headline, dates, publisher, author, image and canonical information." />
      <Status ok label="RSS + Atom feeds" detail="Main, News, Opinion and Sports feeds are available for readers and aggregators." />
      <Status ok={googleVerified} label="Google Search Console verification" detail={googleVerified ? "GOOGLE_SITE_VERIFICATION is configured." : "Add GOOGLE_SITE_VERIFICATION in Vercel after verifying the property in Google Search Console."} />
      <Status ok={bingVerified} label="Bing Webmaster verification" detail={bingVerified ? "BING_SITE_VERIFICATION is configured." : "Add BING_SITE_VERIFICATION in Vercel if Bing asks for a meta verification token."} />
      <Status ok={indexNow} label="IndexNow" detail={indexNow ? "Published stories can notify participating search engines automatically." : "Add INDEXNOW_KEY in Vercel to enable instant URL notifications."} />
      <Status ok label="Author identity" detail="Writer profiles now expose canonical profile metadata and Person structured data." />
    </section>
    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-2xl border bg-white p-6"><h2 className="font-serif text-2xl font-black">Public endpoints</h2><div className="mt-4 grid gap-2 text-sm font-semibold">
        <a className="hover:underline" href="/news-sitemap.xml" target="_blank">Google News sitemap →</a><a className="hover:underline" href="/sitemap.xml" target="_blank">Search sitemap →</a><a className="hover:underline" href="/rss.xml" target="_blank">Main RSS →</a><a className="hover:underline" href="/feeds/news.xml" target="_blank">News RSS →</a><a className="hover:underline" href="/feeds/opinion.xml" target="_blank">Opinion RSS →</a><a className="hover:underline" href="/feeds/sports.xml" target="_blank">Sports RSS →</a><a className="hover:underline" href="/atom.xml" target="_blank">Atom feed →</a>
      </div></div>
      <div className="rounded-2xl border bg-white p-6"><h2 className="font-serif text-2xl font-black">Latest published story</h2><p className="mt-3 font-bold">{latest?.title || "No published article found"}</p><p className="mt-1 break-all text-sm text-stone-500">{latestUrl}</p><div className="mt-5"><DistributionTestButton url={latestUrl} /></div></div>
    </section>
    <section className="mt-8 rounded-2xl bg-stone-100 p-6"><h2 className="font-serif text-2xl font-black">External setup</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-stone-700">HGN can publish the technical signals automatically, but Google and Microsoft account ownership still has to be completed by the publisher once. Verify haidagwaiinews.com in Google Search Console and Bing Webmaster Tools, then submit the normal sitemap and news sitemap there.</p><div className="mt-4 flex flex-wrap gap-3"><a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="rounded-lg border border-black px-4 py-2 text-sm font-bold hover:bg-white">Google Search Console</a><a href="https://www.bing.com/webmasters" target="_blank" rel="noreferrer" className="rounded-lg border border-black px-4 py-2 text-sm font-bold hover:bg-white">Bing Webmaster Tools</a><Link href="/admin/seo" className="rounded-lg border border-black px-4 py-2 text-sm font-bold hover:bg-white">SEO Readiness Desk</Link></div></section>
  </main>;
}
