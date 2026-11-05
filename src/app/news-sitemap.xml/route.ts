import { supabase } from "@/lib/supabase";
import {
  includeInNewsSitemap,
  NEWS_SITEMAP_LIMIT,
  newsSitemapCutoff,
  renderNewsSitemap,
  type NewsSitemapArticle,
} from "@/lib/news-sitemap";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NEWS_COLUMNS = "title,slug,published_at,editorial_updated_at,google_news_include";
const PUBLISHED_COLUMNS = "title,slug,published_at,editorial_updated_at";

async function loadRecentNewsArticles(cutoffIso: string) {
  const cutoffMs = new Date(cutoffIso).getTime();
  const primary = await supabase
    .from("articles")
    .select(NEWS_COLUMNS)
    .eq("status", "published")
    .or("google_news_include.eq.true,google_news_include.is.null")
    .not("slug", "is", null)
    .gte("published_at", cutoffIso)
    .order("published_at", { ascending: false })
    .limit(NEWS_SITEMAP_LIMIT);

  let rows = primary.data as NewsSitemapArticle[] | null;
  if (primary.error) {
    // A failed select used to become a 200 empty urlset. The regular sitemap
    // already reads published stories without the Google News columns.
    console.error("Google News sitemap query failed; retrying without news columns.", primary.error.message);
    const fallback = await supabase
      .from("articles")
      .select(PUBLISHED_COLUMNS)
      .eq("status", "published")
      .not("slug", "is", null)
      .gte("published_at", cutoffIso)
      .order("published_at", { ascending: false })
      .limit(NEWS_SITEMAP_LIMIT);
    if (fallback.error) {
      console.error("Google News sitemap fallback query failed.", fallback.error.message);
      return [];
    }
    rows = fallback.data as NewsSitemapArticle[] | null;
  }

  return (rows || []).filter((article) => includeInNewsSitemap(article, cutoffMs));
}

export async function GET() {
  const articles = await loadRecentNewsArticles(newsSitemapCutoff());
  const xml = renderNewsSitemap(articles);

  // An empty file must not sit in the CDN. The previous 15-minute cache, plus
  // an hour of stale-while-revalidate, kept serving zero <url> entries after
  // a story was published.
  const cacheControl = articles.length
    ? "public, max-age=0, s-maxage=120, must-revalidate"
    : "private, no-store";

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  });
}
