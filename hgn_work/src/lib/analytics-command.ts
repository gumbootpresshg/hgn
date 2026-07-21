import { supabase } from "@/lib/supabase";

export type AnalyticsRow = Record<string, any>;

export function analyticsTone(status?: string | null) {
  const s = String(status || "").toLowerCase();
  if (["good", "ready", "complete", "completed", "on_track", "tracking"].includes(s)) return "good";
  if (["blocked", "bad", "risk", "stale", "needs_fix"].includes(s)) return "bad";
  if (["watch", "open", "draft", "review", "pending"].includes(s)) return "warn";
  return "neutral";
}

export function analyticsToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

async function readTable(table: string, order = "created_at") {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending: false }).limit(100);
  if (error) return [] as AnalyticsRow[];
  return (data || []) as AnalyticsRow[];
}

export async function getAnalyticsCommandSnapshot() {
  const [stories, kpis, sources, reviews] = await Promise.all([
    readTable("analytics_story_snapshots", "snapshot_date"),
    readTable("newsroom_kpi_snapshots", "snapshot_date"),
    readTable("traffic_source_summaries", "snapshot_date"),
    readTable("beta_engagement_reviews", "created_at"),
  ]);

  const totalViews = stories.reduce((sum, item) => sum + Number(item.views || 0), 0);
  const totalVisitors = stories.reduce((sum, item) => sum + Number(item.unique_visitors || 0), 0);
  const totalSignups = sources.reduce((sum, item) => sum + Number(item.signups || 0), 0);
  const activeSources = sources.filter((item) => ["tracking", "good", "active"].includes(String(item.status || "").toLowerCase())).length;
  const openReviews = reviews.filter((item) => !["done", "complete", "completed"].includes(String(item.status || "").toLowerCase())).length;
  const kpisOnTrack = kpis.filter((item) => {
    const target = Number(item.target || 0);
    if (!target) return ["good", "on_track", "ready"].includes(String(item.status || "").toLowerCase());
    return Number(item.value || 0) >= target;
  }).length;

  const score = Math.max(0, Math.min(100,
    Math.min(25, stories.length * 8) +
    Math.min(20, activeSources * 7) +
    Math.min(25, kpisOnTrack * 9) +
    Math.min(15, totalViews > 0 ? 15 : 0) +
    Math.min(15, totalSignups > 0 ? 15 : 0) -
    Math.min(20, openReviews * 4)
  ));

  return { score, stories, kpis, sources, reviews, totalViews, totalVisitors, totalSignups, activeSources, openReviews, kpisOnTrack };
}
