import { supabase } from "@/lib/supabase";
import { absoluteUrl, xmlEscape } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: articles } = await supabase
    .from("articles")
    .select("title,slug,published_at,updated_at,status")
    .eq("status", "published")
    .not("slug", "is", null)
    .gte("published_at", twoDaysAgo)
    .order("published_at", { ascending: false })
    .limit(1000);

  const urls = (articles || [])
    .filter((article: any) => article.slug && article.title && article.published_at)
    .map((article: any) => {
      const loc = absoluteUrl(`/articles/${article.slug}`);
      const publishedAt = new Date(article.published_at).toISOString();
      return [
        "<url>",
        `<loc>${xmlEscape(loc)}</loc>`,
        "<news:news>",
        "<news:publication>",
        "<news:name>Haida Gwaii News</news:name>",
        "<news:language>en</news:language>",
        "</news:publication>",
        `<news:publication_date>${publishedAt}</news:publication_date>`,
        `<news:title>${xmlEscape(article.title)}</news:title>`,
        "</news:news>",
        article.updated_at ? `<lastmod>${new Date(article.updated_at).toISOString()}</lastmod>` : "",
        "</url>",
      ].join("");
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
