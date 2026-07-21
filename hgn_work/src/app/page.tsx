import HomeUpcomingEvents from "@/components/HomeUpcomingEvents"
import HomePoll from "@/components/HomePoll"
import AdSlot from "@/components/AdSlot"
import Link from "next/link";
import { supabase } from "@/lib/supabase";


function isArticleFeatured(article: any) {
  return Boolean(article?.is_featured || article?.featured)
}

function withoutFeaturedArticles<T extends any>(items: T[] | null | undefined) {
  return (items || []).filter((item: any) => !isArticleFeatured(item))
}




export const revalidate = 60;

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  author_name?: string | null;
  category?: string | null;
  section?: string | null;
  image_url?: string | null;
  published_at?: string | null;
  featured?: boolean | null;
  front_page_main?: boolean | null;
};

function plainExcerpt(article: Article) {
  return (
    article.excerpt ||
    article.body?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 180) ||
    ""
  );
}

function articleImage(article: Article) {
  return article.image_url || "/news-placeholder.jpg";
}

function ArticleCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  return (
    <Link href={`/articles/${article.slug}`} className="group block border-b border-slate-200 pb-5">
      <div className={compact ? "block" : "grid gap-4 sm:grid-cols-[180px_1fr]"}>
        {!compact && (
          <img src={articleImage(article)} alt="" className="h-32 w-full rounded-xl object-cover" />
        )}
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">
            {article.category || article.section || "News"}
          </div>
          <h3 className={compact ? "mt-1 text-lg font-black leading-tight text-slate-950 group-hover:text-hgnBlue" : "mt-1 text-xl font-black leading-tight text-slate-950 group-hover:text-hgnBlue"}>
            {article.title}
          </h3>
          <p className={compact ? "mt-2 line-clamp-2 text-sm leading-6 text-slate-700" : "mt-2 line-clamp-2 text-sm text-slate-700"}>{plainExcerpt(article)}</p>
          <p className="mt-2 text-xs text-slate-500">
            {article.author_name || "Haida Gwaii News"}
            {article.published_at ? ` · ${new Date(article.published_at).toLocaleDateString("en-CA")}` : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default async function Home() {
  const { data: mainStories } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("front_page_main", true)
    .order("published_at", { ascending: false })
    .limit(1);

  const { data: featuredStories } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(6);

  const { data: latestStories } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(24);


  const main = (mainStories?.[0] || latestStories?.[0]) as Article | undefined;
  const sideStories = ((featuredStories?.length ? featuredStories : latestStories) || [])
    .filter((a: Article) => a.slug !== main?.slug)
    .slice(0, 4) as Article[];
  const usedHomeStorySlugs = new Set([main?.slug, ...sideStories.map((article) => article.slug)].filter(Boolean));
  const feed = (latestStories || [])
    .filter((a: Article) => !usedHomeStorySlugs.has(a.slug))
    .slice(0, 18) as Article[];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="border-b border-slate-300 pb-8">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.8fr]">
          {main && (
            <Link href={`/articles/${main.slug}`} className="group block">
              <img src={articleImage(main)} alt="" className="h-[360px] w-full rounded-2xl object-cover" />
              <div className="mt-4 text-xs font-black uppercase tracking-wide text-hgnBlue">
                {main.category || "Top Story"}
              </div>
              <h1 className="mt-2 text-4xl font-black leading-tight text-slate-950 md:text-6xl group-hover:text-hgnBlue">
                {main.title}
              </h1>
              <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-700">{plainExcerpt(main)}</p>
              <p className="mt-3 text-sm text-slate-500">By {main.author_name || "Haida Gwaii News"}</p>
            </Link>
          )}

          <div className="grid gap-5">
            {sideStories.map((article) => (
              <ArticleCard key={article.id} article={article} compact />
            ))}
</div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/events" className="rounded-2xl border bg-white p-5 shadow-sm hover:border-hgnBlue">
          <p className="text-xs font-black uppercase tracking-wide text-hgnBlue">What's Happening</p>
          <h2 className="mt-1 text-2xl font-black text-hgnNavy">Community Calendar</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Events today, this weekend, community meetings, sports, music and local gatherings.</p>
        </Link>
        <Link href="/live-map" className="rounded-2xl border bg-white p-5 shadow-sm hover:border-hgnBlue">
          <p className="text-xs font-black uppercase tracking-wide text-hgnBlue">Island Utility</p>
          <h2 className="mt-1 text-2xl font-black text-hgnNavy">Live Map</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">See alerts, events, notices, delays and community items around Haida Gwaii.</p>
        </Link>
        <Link href="/support-us" className="rounded-2xl border bg-hgnNavy p-5 text-white shadow-sm hover:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-wide text-sky-200">Reader Supported</p>
          <h2 className="mt-1 text-2xl font-black">Keep HGN Free</h2>
          <p className="mt-2 text-sm leading-6 text-slate-100">Support local journalism, the print paper and the website for everyone.</p>
        </Link>
      </section>

      <section className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-5 flex items-end justify-between border-b border-slate-300 pb-3">
            <h2 className="text-3xl font-black text-slate-950">More Local Stories</h2>
            <Link href="/articles" className="text-sm font-black text-hgnBlue hover:underline">All news →</Link>
          </div>
          <div className="grid gap-6">
            {feed.map((article, index) => (
              <div key={article.id}>
                <ArticleCard article={article} />
                {index === 4 && (
                  <AdSlot placement="home_middle" fallbackHouseAd />
                )}
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
<div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-xl font-black text-slate-950">Reader Sections</h3>
            <div className="mt-4 grid gap-2 text-sm font-bold text-hgnBlue">
              <Link href="/articles" className="hover:underline">Latest News</Link>
              <Link href="/articles?category=Sports" className="hover:underline">Sports</Link>
              <Link href="/opinion" className="hover:underline">Opinion, editorials & columns</Link>
              <Link href="/letters" className="hover:underline">Letters to the Editor</Link>
              <Link href="/marketplace" className="hover:underline">Marketplace</Link>
              <Link href="/live-map" className="hover:underline">Live Map</Link>
              <Link href="/support-us" className="hover:underline">Support local journalism</Link>
            </div>
          </div>
<HomeUpcomingEvents />
          <HomePoll />
</aside>
      </section>
</main>
  );
}
