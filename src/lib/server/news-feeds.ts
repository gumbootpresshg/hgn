import sharp from "sharp";
import { articleStoryImage } from "@/lib/article-images";
import { supabase } from "@/lib/supabase";
import { absoluteUrl, SITE, stripHtml, xmlEscape } from "@/lib/site";

export type FeedKind = "all" | "news" | "opinion" | "sports";

const EXCERPT_TARGET = 300;
const EXCERPT_MAX = 800;

export type FeedImage = {
  url: string;
  type?: string;
  length?: number;
  width?: number;
  height?: number;
};

type FeedArticle = {
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  dek?: string | null;
  meta_description?: string | null;
  body?: string | null;
  content?: string | null;
  author_name?: string | null;
  author?: string | null;
  category?: string | null;
  subcategory?: string | null;
  image_url?: string | null;
  cover_image_url?: string | null;
  og_image_url?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  editorial_updated_at?: string | null;
  feedDescription?: string;
  feedImage?: FeedImage | null;
};

function matchesKind(article: FeedArticle, kind: FeedKind) {
  if (kind === "all") return true;
  const haystack = `${article.category || ""} ${article.subcategory || ""}`.toLowerCase();
  if (kind === "sports") return haystack.includes("sport") || haystack.includes("hockey");
  if (kind === "opinion") return /opinion|editorial|column|letter|on the record/.test(haystack);
  return !/opinion|editorial|column|letter|obituar|sport|hockey/.test(haystack);
}

function plainText(value?: string | null) {
  const stripped = stripHtml(String(value || ""))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => {
      const point = Number(code);
      return Number.isFinite(point) ? String.fromCodePoint(point) : "";
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => {
      const point = Number.parseInt(code, 16);
      return Number.isFinite(point) ? String.fromCodePoint(point) : "";
    });
  return stripped.replace(/\s+/g, " ").trim();
}

export function clipFeedExcerpt(value: string) {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= EXCERPT_MAX) return text;
  const window = text.slice(0, EXCERPT_MAX + 1);
  const sentence = window.match(/^[\s\S]{300,}?[.!?](?:\s|$)/);
  if (sentence && sentence[0].trim().length <= EXCERPT_MAX) return sentence[0].trim();
  const space = window.lastIndexOf(" ");
  return (space >= EXCERPT_TARGET ? window.slice(0, space) : text.slice(0, EXCERPT_MAX)).trim();
}

// Uses only text the article already has. A short excerpt is extended from the
// opening of the body when that text exists. Nothing is written to fill a gap.
export function feedDescription(article: FeedArticle) {
  const excerpt = plainText(article.excerpt);
  const dek = plainText(article.dek);
  const summary = plainText(article.meta_description);
  const body = plainText(article.body || article.content);
  const source = excerpt.length >= EXCERPT_TARGET
    ? excerpt
    : [body, excerpt, dek, summary].sort((a, b) => b.length - a.length)[0] || "";
  return clipFeedExcerpt(source);
}

function mimeFromPath(url: string) {
  const path = url.split("?")[0].toLowerCase();
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".gif")) return "image/gif";
  if (path.endsWith(".avif")) return "image/avif";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  return "";
}

function mimeFromFormat(format?: string) {
  if (format === "jpeg" || format === "jpg") return "image/jpeg";
  if (format === "png") return "image/png";
  if (format === "webp") return "image/webp";
  if (format === "gif") return "image/gif";
  if (format === "avif") return "image/avif";
  return "";
}

async function inspectStoryImage(article: FeedArticle): Promise<FeedImage | null> {
  const source = articleStoryImage(article);
  if (!source) return null;
  const url = absoluteUrl(source);
  const fallbackType = mimeFromPath(url);
  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!response.ok) return fallbackType ? { url, type: fallbackType } : { url };
    const bytes = Buffer.from(await response.arrayBuffer());
    const headerLength = Number(response.headers.get("content-length"));
    const metadata = await sharp(bytes, { failOn: "none", limitInputPixels: false }).metadata();
    const type = mimeFromFormat(metadata.format) || response.headers.get("content-type")?.split(";")[0].trim() || fallbackType;
    if (type && !type.startsWith("image/")) return null;
    return {
      url,
      type: type || undefined,
      length: Number.isFinite(headerLength) && headerLength > 0 ? headerLength : bytes.length || undefined,
      width: metadata.width || undefined,
      height: metadata.height || undefined,
    };
  } catch {
    return fallbackType ? { url, type: fallbackType } : { url };
  }
}

export async function getFeedArticles(kind: FeedKind, limit = 50) {
  const { data } = await supabase
    .from("articles")
    .select("title,slug,excerpt,dek,meta_description,body,content,author_name,author,category,subcategory,image_url,cover_image_url,og_image_url,published_at,updated_at,editorial_updated_at,status")
    .eq("status", "published")
    .not("slug", "is", null)
    .order("published_at", { ascending: false })
    .limit(Math.max(limit * 3, 100));

  const articles = ((data || []) as FeedArticle[]).filter((article) => article.slug && article.title && matchesKind(article, kind)).slice(0, limit);
  const images = await Promise.all(articles.map((article) => inspectStoryImage(article)));
  return articles.map((article, index) => ({
    ...article,
    feedDescription: feedDescription(article),
    feedImage: images[index],
  }));
}

export function feedTitle(kind: FeedKind) {
  if (kind === "sports") return `${SITE.name} Sports`;
  if (kind === "opinion") return `${SITE.name} Opinion`;
  if (kind === "news") return `${SITE.name} News`;
  return SITE.name;
}

function imageTags(image?: FeedImage | null) {
  if (!image?.url) return "";
  const attrs = [
    `url="${xmlEscape(image.url)}"`,
    image.type ? `type="${xmlEscape(image.type)}"` : "",
    image.width ? `width="${image.width}"` : "",
    image.height ? `height="${image.height}"` : "",
  ].filter(Boolean).join(" ");
  const enclosure = image.type && image.length
    ? `<enclosure url="${xmlEscape(image.url)}" length="${image.length}" type="${xmlEscape(image.type)}"/>`
    : "";
  const thumbnail = [
    `<media:thumbnail url="${xmlEscape(image.url)}"`,
    image.width ? `width="${image.width}"` : "",
    image.height ? `height="${image.height}"` : "",
  ].filter(Boolean).join(" ") + "/>";
  return `${enclosure}<media:content ${attrs} medium="image"/>${thumbnail}`;
}

export function renderRss(kind: FeedKind, articles: FeedArticle[]) {
  const title = feedTitle(kind);
  const feedUrl = kind === "all" ? absoluteUrl("/rss.xml") : absoluteUrl(`/feeds/${kind}.xml`);
  const items = articles.map((article) => {
    const url = absoluteUrl(`/articles/${article.slug}`);
    const description = article.feedDescription ?? feedDescription(article);
    const author = article.author_name || article.author || SITE.name;
    return [
      "<item>",
      `<title>${xmlEscape(article.title || "")}</title>`,
      `<link>${xmlEscape(url)}</link>`,
      `<guid isPermaLink="true">${xmlEscape(url)}</guid>`,
      description ? `<description>${xmlEscape(description)}</description>` : "",
      `<dc:creator>${xmlEscape(author)}</dc:creator>`,
      article.category ? `<category>${xmlEscape(article.category)}</category>` : "",
      article.published_at ? `<pubDate>${new Date(article.published_at).toUTCString()}</pubDate>` : "",
      imageTags(article.feedImage),
      "</item>",
    ].filter(Boolean).join("");
  }).join("");

  // The channel link stays the public site. The feed URL is the atom:link self.
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/"><channel><title>${xmlEscape(title)}</title><link>${xmlEscape(SITE.url)}</link><description>${xmlEscape(SITE.description)}</description><language>en-CA</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate><atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${xmlEscape(feedUrl)}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
}

export function renderAtom(articles: FeedArticle[]) {
  const entries = articles.map((article) => {
    const url = absoluteUrl(`/articles/${article.slug}`);
    const published = article.published_at || article.updated_at || new Date().toISOString();
    const updated = article.editorial_updated_at || published;
    const author = article.author_name || article.author || SITE.name;
    const description = article.feedDescription ?? feedDescription(article);
    const image = article.feedImage;
    const enclosure = image?.url
      ? `<link rel="enclosure" href="${xmlEscape(image.url)}"${image.type ? ` type="${xmlEscape(image.type)}"` : ""}${image.length ? ` length="${image.length}"` : ""}/>`
      : "";
    return `<entry><title>${xmlEscape(article.title || "")}</title><link href="${xmlEscape(url)}"/>${enclosure}<id>${xmlEscape(url)}</id><published>${xmlEscape(new Date(published).toISOString())}</published><updated>${xmlEscape(new Date(updated).toISOString())}</updated><author><name>${xmlEscape(author)}</name></author>${description ? `<summary>${xmlEscape(description)}</summary>` : ""}</entry>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><title>${xmlEscape(SITE.name)}</title><id>${xmlEscape(SITE.url)}</id><link href="${xmlEscape(SITE.url)}"/><link rel="self" href="${xmlEscape(absoluteUrl("/atom.xml"))}"/><updated>${new Date().toISOString()}</updated>${entries}</feed>`;
}
