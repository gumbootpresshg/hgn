import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";
function escapeXml(value = "") { return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&apos;"); }
export async function GET() {
 const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://haidagwaiinews.com";
 const twoDaysAgo = new Date(Date.now() - 48*60*60*1000).toISOString();
 const { data: articles } = await supabase.from("articles").select("title,slug,published_at").eq("status","published").gte("published_at",twoDaysAgo).order("published_at",{ascending:false}).limit(1000);
 const urls=(articles||[]).map((a:any)=>`<url><loc>${siteUrl}/articles/${escapeXml(a.slug)}</loc><news:news><news:publication><news:name>Haida Gwaii News</news:name><news:language>en</news:language></news:publication><news:publication_date>${a.published_at ? new Date(a.published_at).toISOString() : new Date().toISOString()}</news:publication_date><news:title>${escapeXml(a.title)}</news:title></news:news></url>`).join("");
 const xml=`<?xml version="1.0" encoding="UTF-8" ?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}</urlset>`;
 return new Response(xml,{headers:{"Content-Type":"application/xml; charset=utf-8"}});
}