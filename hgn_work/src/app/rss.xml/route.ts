import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";
function escapeXml(value = "") { return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&apos;"); }
export async function GET() {
 const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://haidagwaiinews.com";
 const { data: articles } = await supabase.from("articles").select("title,slug,excerpt,published_at,author_name").eq("status","published").order("published_at",{ascending:false}).limit(50);
 const items = (articles||[]).map((a:any)=>`<item><title>${escapeXml(a.title)}</title><link>${siteUrl}/articles/${escapeXml(a.slug)}</link><guid>${siteUrl}/articles/${escapeXml(a.slug)}</guid><description>${escapeXml(a.excerpt || "")}</description><author>${escapeXml(a.author_name || "Haida Gwaii News")}</author><pubDate>${a.published_at ? new Date(a.published_at).toUTCString() : new Date().toUTCString()}</pubDate></item>`).join("");
 const xml = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0"><channel><title>Haida Gwaii News</title><link>${siteUrl}</link><description>Local news from Haida Gwaii.</description>${items}</channel></rss>`;
 return new Response(xml,{headers:{"Content-Type":"application/rss+xml; charset=utf-8"}});
}