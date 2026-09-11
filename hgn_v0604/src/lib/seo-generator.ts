export type SeoSource = {
  title?: string | null;
  body?: string | null;
  excerpt?: string | null;
  author_name?: string | null;
  category?: string | null;
  subcategory?: string | null;
  image_caption?: string | null;
  image_credit?: string | null;
  image_alt?: string | null;
};

function plainText(value?: string | null) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function clipWords(value: string, max: number) {
  const text = plainText(value);
  if (text.length <= max) return text;
  const clipped = text.slice(0, max + 1).replace(/\s+\S*$/, "").replace(/[,:;\-\s]+$/, "");
  return `${clipped || text.slice(0, max).trim()}…`;
}

export function seoSlug(value?: string | null) {
  return plainText(value)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/g, "");
}

function firstUsefulSentence(source: SeoSource) {
  const excerpt = plainText(source.excerpt);
  if (excerpt.length >= 50) return excerpt;
  const body = plainText(source.body);
  const sentence = body.match(/^(.{45,260}?[.!?])(?:\s|$)/)?.[1];
  return sentence || body;
}

function keywordList(source: SeoSource) {
  const base = [source.category, source.subcategory, "Haida Gwaii", "Haida Gwaii News"]
    .map((item) => plainText(item))
    .filter(Boolean);
  const titleWords = plainText(source.title)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 4 && !["about", "after", "before", "their", "there", "which", "would", "could", "haida", "gwaii"].includes(word));
  return Array.from(new Set([...base, ...titleWords.slice(0, 6)])).slice(0, 10);
}

export function generateSeoFields(source: SeoSource) {
  const title = plainText(source.title) || "Haida Gwaii News";
  const summary = firstUsefulSentence(source);
  const metaDescription = clipWords(summary || `${title}. Local reporting from Haida Gwaii News.`, 158);
  const caption = plainText(source.image_caption);
  const imageAlt = plainText(source.image_alt) || clipWords(caption || `Photo related to ${title}`, 160);
  const keywords = keywordList(source);

  return {
    slug: seoSlug(title),
    seo_title: clipWords(title, 68),
    meta_description: metaDescription,
    social_title: clipWords(title, 90),
    social_description: clipWords(summary || metaDescription, 200),
    og_image_url: null as string | null,
    image_alt: imageAlt,
    seo_keywords: keywords,
    google_news_headline: clipWords(title, 110),
    seo_generated_at: new Date().toISOString(),
  };
}

export function seoReadiness(article: Record<string, any>) {
  const checks = [
    { key: "title", label: "Headline", ok: plainText(article.title).length >= 10 },
    { key: "body", label: "Article body", ok: plainText(article.body).length >= 150 },
    { key: "author", label: "Author", ok: plainText(article.author_name || article.author).length >= 2 },
    { key: "slug", label: "URL slug", ok: plainText(article.slug).length >= 5 },
    { key: "description", label: "SEO description", ok: plainText(article.meta_description).length >= 70 },
    { key: "image", label: "Lead image", ok: Boolean(article.image_url) },
    { key: "alt", label: "Image alt text", ok: !article.image_url || plainText(article.image_alt).length >= 8 },
    { key: "caption", label: "Photo caption", ok: !article.image_url || plainText(article.image_caption).length >= 8 },
    { key: "credit", label: "Photo credit", ok: !article.image_url || plainText(article.image_credit).length >= 2 },
    { key: "category", label: "Category", ok: Boolean(article.category || article.section) },
  ];
  const passed = checks.filter((check) => check.ok).length;
  return { checks, passed, total: checks.length, score: Math.round((passed / checks.length) * 100) };
}
