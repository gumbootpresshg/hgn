import { supabase } from "@/lib/supabase";
import { absoluteUrl, SITE, xmlEscape } from "@/lib/site";

export type FeedKind = "all" | "news" | "opinion" | "sports";

type FeedArticle = {
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  body?: string | null;
  author_name?: string | null;
  author?: string | null;
  category?: string | null;
  subcategory?: string | null;
  image_url?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
};

function matchesKind(article: FeedArticle, kind: FeedKind) {
  if (kind === "all") return true;
  const haystack = `${article.category || ""} ${article.subcategory || ""}`.toLowerCase();
  if (kind === "sports") return haystack.includes("sport") || haystack.includes("hockey");
  if (kind === "opinion") return /opinion|editorial|column|letter|on the record/.test(haystack);
  return !/opinion|editorial|column|letter|obituar|sport|hockey/.test(haystack);
}

export async function getFeedArticles(kind: FeedKind, limit = 50) {
  const { data } = await supabase
    .from("articles")
    .select("title,slug,excerpt,body,author_name,author,category,subcategory,image_url,published_at,updated_at,status")
    .eq("status", "published")
    .not("slug", "is", null)
    .order("published_at", { ascending: false })
    .limit(Math.max(limit * 3, 100));

  return ((data || []) as FeedArticle[]).filter((article) => article.slug && article.title && matchesKind(article, kind)).slice(0, limit);
}

export function feedTitle(kind: FeedKind) {
  if (kind === "sports") return `${SITE.name} Sports`;
  if (kind === "opinion") return `${SITE.name} Opinion`;
  if (kind === "news") return `${SITE.name} News`;
  return SITE.name;
}

export function renderRss(kind: FeedKind, articles: FeedArticle[]) {
  const title = feedTitle(kind);
  const feedUrl = kind === "all" ? absoluteUrl("/rss.xml") : absoluteUrl(`/feeds/${kind}.xml`);
  const items = articles.map((article) => {
    const url = absoluteUrl(`/articles/${article.slug}`);
    const description = String(article.excerpt || "").trim();
    const author = article.author_name || article.author || SITE.name;
    return [
      "<item>",
      `<title>${xmlEscape(article.title || "")}</title>`,
      `<link>${xmlEscape(url)}</link>`,
      `<guid isPermaLink="true">${xmlEscape(url)}</guid>`,
      `<description>${xmlEscape(description)}</description>`,
      `<dc:creator>${xmlEscape(author)}</dc:creator>`,
      article.category ? `<category>${xmlEscape(article.category)}</category>` : "",
      article.published_at ? `<pubDate>${new Date(article.published_at).toUTCString()}</pubDate>` : "",
      article.image_url ? `<media:content url="${xmlEscape(absoluteUrl(article.image_url))}" medium="image" />` : "",
      "</item>",
    ].join("");
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/"><channel><title>${xmlEscape(title)}</title><link>${xmlEscape(SITE.url)}</link><description>${xmlEscape(SITE.description)}</description><language>en-ca</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate><atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${xmlEscape(feedUrl)}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
}

export function renderAtom(articles: FeedArticle[]) {
  const entries = articles.map((article) => {
    const url = absoluteUrl(`/articles/${article.slug}`);
    const published = article.published_at || article.updated_at || new Date().toISOString();
    const updated = article.updated_at || published;
    const author = article.author_name || article.author || SITE.name;
    return `<entry><title>${xmlEscape(article.title || "")}</title><link href="${xmlEscape(url)}"/><id>${xmlEscape(url)}</id><published>${xmlEscape(new Date(published).toISOString())}</published><updated>${xmlEscape(new Date(updated).toISOString())}</updated><author><name>${xmlEscape(author)}</name></author><summary>${xmlEscape(article.excerpt || "")}</summary></entry>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><title>${xmlEscape(SITE.name)}</title><id>${xmlEscape(SITE.url)}</id><link href="${xmlEscape(SITE.url)}"/><link rel="self" href="${xmlEscape(absoluteUrl("/atom.xml"))}"/><updated>${new Date().toISOString()}</updated>${entries}</feed>`;
}
