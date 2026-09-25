import { NextRequest, NextResponse } from "next/server";
import { requirePublisher } from "@/lib/newsletters/server";
import { getVercelTrafficMetrics } from "@/lib/vercel-web-analytics";

export const runtime = "nodejs";

function daysFromRequest(req: NextRequest) {
  const requested = Number(new URL(req.url).searchParams.get("days") || 30);
  return [1, 7, 30, 90].includes(requested) ? requested : 30;
}

function startForDays(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - (days - 1));
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}

function countBy<T>(values: T[], key: (value: T) => string | null | undefined) {
  return values.reduce<Record<string, number>>((counts, value) => {
    const name = key(value);
    if (name) counts[name] = (counts[name] || 0) + 1;
    return counts;
  }, {});
}

export async function GET(req: NextRequest) {
  const access = await requirePublisher(req);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const days = daysFromRequest(req);
  const since = startForDays(days);
  const until = new Date().toISOString();
  const { data: events, error } = await access.db
    .from("hgn_public_analytics_events")
    .select("event_type,page_path,article_id,article_slug,ad_id,placement_key,source,occurred_at")
    .gte("occurred_at", since)
    .lt("occurred_at", until)
    .order("occurred_at", { ascending: false })
    .limit(50000);

  if (error) return NextResponse.json({ error: "Analytics storage is not ready. Run supabase/v296-public-analytics.sql first." }, { status: 503 });
  const rows = events || [];
  const articleSlugs = Array.from(new Set(rows.map((row: any) => row.article_slug).filter(Boolean)));
  const adIds = Array.from(new Set(rows.map((row: any) => row.ad_id).filter(Boolean)));
  const [{ data: articles }, { data: ads }, { data: newsletterAds }, vercel] = await Promise.all([
    articleSlugs.length ? access.db.from("articles").select("id,slug,title,category,published_at").in("slug", articleSlugs.slice(0, 500)) : Promise.resolve({ data: [] }),
    adIds.length ? access.db.from("ads").select("id,title,advertiser_name,placement_key,status,start_date,end_date").in("id", adIds.slice(0, 500)) : Promise.resolve({ data: [] }),
    adIds.length ? access.db.from("hgn_newsletter_ad_campaigns").select("id,advertiser_name,placement,status,start_date,end_date").in("id", adIds.slice(0, 500)) : Promise.resolve({ data: [] }),
    getVercelTrafficMetrics(since, until),
  ]);

  const articleBySlug = new Map((articles || []).map((article: any) => [article.slug, article]));
  const adById = new Map((ads || []).map((ad: any) => [ad.id, ad]));
  (newsletterAds || []).forEach((ad: any) => adById.set(ad.id, { ...ad, title: ad.advertiser_name, placement_key: ad.placement }));
  const articleCounts = countBy(rows.filter((row: any) => row.event_type === "article_view"), (row: any) => row.article_slug);
  const adImpressions = countBy(rows.filter((row: any) => row.event_type === "ad_impression"), (row: any) => row.ad_id);
  const adClicks = countBy(rows.filter((row: any) => row.event_type === "ad_click"), (row: any) => row.ad_id);
  const actions = countBy(rows, (row: any) => row.event_type);
  const topArticles = Object.entries(articleCounts)
    .map(([slug, views]) => ({ slug, views, article: articleBySlug.get(slug) || null }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20);
  const adPerformance = Array.from(new Set([...Object.keys(adImpressions), ...Object.keys(adClicks)]))
    .map((id) => {
      const impressions = adImpressions[id] || 0;
      const clicks = adClicks[id] || 0;
      return { id, impressions, clicks, ctr: impressions ? Number(((clicks / impressions) * 100).toFixed(2)) : null, ad: adById.get(id) || null };
    })
    .sort((a, b) => (b.impressions + b.clicks) - (a.impressions + a.clicks))
    .slice(0, 30);
  const topPages = Object.entries(countBy(rows, (row: any) => row.page_path)).map(([path, events]) => ({ path, events })).sort((a, b) => b.events - a.events).slice(0, 15);
  const byDay = countBy(rows, (row: any) => String(row.occurred_at || "").slice(0, 10));

  return NextResponse.json({
    period: { days, since, until },
    traffic: vercel,
    totals: {
      trackedEvents: rows.length,
      articleViews: actions.article_view || 0,
      newsletterSignups: actions.newsletter_signup || 0,
      adImpressions: actions.ad_impression || 0,
      adClicks: actions.ad_click || 0,
      supportClicks: actions.support_click || 0,
    },
    actions: Object.entries(actions).map(([eventType, count]) => ({ eventType, count })).sort((a, b) => b.count - a.count),
    topArticles,
    adPerformance,
    topPages,
    byDay: Object.entries(byDay).map(([date, events]) => ({ date, events })).sort((a, b) => a.date.localeCompare(b.date)),
  }, { headers: { "Cache-Control": "no-store" } });
}
