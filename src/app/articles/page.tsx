import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AdSlot from "@/components/AdSlot";

export const revalidate = 60;

type PageProps = { searchParams?: Promise<{ category?: string }> };

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  author_name?: string | null;
  category?: string | null;
  image_url?: string | null;
  cover_image_url?: string | null;
  published_at?: string | null;
};

const separateSections = new Set([
  "letter",
  "letters",
  "letters to the editor",
  "editorial",
  "editorials",
  "opinion",
  "column",
  "columns",
  "community voices",
]);

function isNewsCategory(cat?: string | null) {
  const value = String(cat || "").trim().toLowerCase();
  return value && !separateSections.has(value);
}

function excerpt(article: Article) {
  return (
    article.excerpt ||
    article.body?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 220) ||
    ""
  );
}

export default async function Articles({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : {};
  const selectedCategory = sp.category || "";

  const { data: categoryRows } = await supabase
    .from("articles")
    .select("category")
    .eq("status", "published")
    .not("category", "is", null)
    .limit(2000);

  const categories = Array.from(
    new Set((categoryRows || []).map((r: any) => r.category).filter(isNewsCategory))
  ).sort();

  let query = supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(120);

  if (selectedCategory && isNewsCategory(selectedCategory)) {
    query = query.eq("category", selectedCategory);
  } else {
    query = query.not("category", "in", '("Letters","Letter","Letters to the Editor","Editorial","Editorials","Opinion","Column","Columns","Community Voices")');
  }

  const { data: articles } = await query;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="border-b pb-6">
        <div className="text-sm font-black uppercase tracking-widest text-hgnBlue">News Desk</div>
        <h1 className="mt-2 text-4xl font-black text-hgnNavy">Latest News</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Scroll the latest local reporting. Letters, editorials and columns now live in their own reader sections.
        </p>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto border-b pb-4">
        <Link href="/articles" className={`shrink-0 rounded-full px-4 py-2 text-sm font-black ${!selectedCategory ? "bg-hgnNavy text-white" : "bg-slate-100 text-slate-700"}`}>All News</Link>
        {categories.map((cat) => (
          <Link key={cat} href={`/articles?category=${encodeURIComponent(cat)}`} className={`shrink-0 rounded-full px-4 py-2 text-sm font-black ${selectedCategory === cat ? "bg-hgnNavy text-white" : "bg-slate-100 text-slate-700"}`}>{cat}</Link>
        ))}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <section className="grid gap-6">
          {(articles || []).map((article: Article, i: number) => (
            <div key={article.id}>
              <Link href={`/articles/${article.slug}`} className="block border-b pb-6 hover:opacity-90">
                <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                  <img src={article.cover_image_url || article.image_url || "/news-placeholder.svg"} alt="" className="h-40 w-full rounded-xl object-cover" />
                  <div>
                    <div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{article.subcategory || article.category || "News"}</div>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">{article.title}</h2>
                    <p className="mt-2 line-clamp-3 text-slate-700">{excerpt(article)}</p>
                    <p className="mt-3 text-sm text-slate-500">
                      {article.author_name || "Haida Gwaii News"}
                      {article.published_at ? ` · ${new Date(article.published_at).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}` : ""}
                    </p>
                  </div>
                </div>
              </Link>
              {(i + 1) % 5 === 0 && <div className="mt-6"><AdSlot placement="article-feed" /></div>}
            </div>
          ))}
        </section>

        <aside className="space-y-6">
          <div className="hgn-card p-5">
            <h3 className="text-xl font-black text-hgnNavy">Reader sections</h3>
            <div className="mt-4 grid gap-2 text-sm font-bold text-hgnBlue">
              <Link href="/opinion" className="hover:underline">Opinion, editorials & columns</Link>
              <Link href="/letters" className="hover:underline">Letters to the Editor</Link>
              <Link href="/events" className="hover:underline">Events</Link>
              <Link href="/marketplace" className="hover:underline">Marketplace</Link>
            </div>
          </div>
          <AdSlot placement="sidebar-top" />
          <AdSlot placement="sidebar-mid" />
          <AdSlot placement="sidebar-bottom" />
        </aside>
      </div>
    </main>
  );
}
