import { absoluteUrl, SITE, xmlEscape } from "@/lib/site";

// Google News sitemaps only include articles from about the last two days.
// https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
export const NEWS_SITEMAP_WINDOW_MS = 48 * 60 * 60 * 1000;
export const NEWS_SITEMAP_LIMIT = 1000;

export type NewsSitemapArticle = {
  title?: string | null;
  slug?: string | null;
  published_at?: string | null;
  editorial_updated_at?: string | null;
  google_news_include?: boolean | null;
};

export function newsSitemapCutoff(now = Date.now()) {
  return new Date(now - NEWS_SITEMAP_WINDOW_MS).toISOString();
}

// The editor treats a missing flag as included. Only an explicit opt-out drops a story.
export function includeInNewsSitemap(article: NewsSitemapArticle, cutoffMs: number) {
  if (article.google_news_include === false) return false;
  const slug = String(article.slug || "").trim();
  const title = String(article.title || "").trim();
  if (!slug || !title || !article.published_at) return false;
  const publishedMs = new Date(article.published_at).getTime();
  return Number.isFinite(publishedMs) && publishedMs >= cutoffMs;
}

function w3cDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  // Fractional seconds are valid W3C datetimes. Google's examples use second precision.
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function renderNewsSitemap(articles: NewsSitemapArticle[]) {
  const urls = articles.map((article) => {
    const loc = absoluteUrl(`/articles/${article.slug}`);
    const publishedAt = w3cDate(String(article.published_at));
    const updatedAt = article.editorial_updated_at ? w3cDate(article.editorial_updated_at) : "";
    return [
      "<url>",
      `<loc>${xmlEscape(loc)}</loc>`,
      "<news:news>",
      "<news:publication>",
      `<news:name>${xmlEscape(SITE.name)}</news:name>`,
      "<news:language>en</news:language>",
      "</news:publication>",
      `<news:publication_date>${publishedAt}</news:publication_date>`,
      `<news:title>${xmlEscape(String(article.title || "").trim())}</news:title>`,
      "</news:news>",
      updatedAt ? `<lastmod>${updatedAt}</lastmod>` : "",
      "</url>",
    ].join("");
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}</urlset>`;
}
