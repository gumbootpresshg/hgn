import { getFeedArticles, renderAtom } from "@/lib/server/news-feeds";
export const dynamic = "force-dynamic";
export async function GET() {
  const xml = renderAtom(await getFeedArticles("all"));
  return new Response(xml, { headers: { "Content-Type": "application/atom+xml; charset=utf-8", "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
}
