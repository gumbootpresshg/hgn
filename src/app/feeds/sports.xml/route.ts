import { getFeedArticles, renderRss } from "@/lib/server/news-feeds";
export const dynamic = "force-dynamic";
export async function GET() {
  const xml = renderRss("sports", await getFeedArticles("sports"));
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
}
