import { supabase } from "@/lib/supabase";

export type PublishBriefRow = Record<string, any>;

async function safeSelect(table: string, order = "updated_at", ascending = false, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as PublishBriefRow[];
  return (data || []) as PublishBriefRow[];
}

export function briefTone(status?: string, isBlocking?: boolean) {
  const value = String(status || "").toLowerCase();
  if (isBlocking || value === "blocked") return "bad";
  if (value === "waiting" || value === "needs_review") return "warn";
  if (value === "done" || value === "published") return "good";
  return "neutral";
}

export function briefToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getPublishBriefSnapshot() {
  const [briefs, items] = await Promise.all([
    safeSelect("daily_publish_briefs", "brief_date", false, 30),
    safeSelect("daily_publish_brief_items", "sort_order", true, 100),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const todayBrief = briefs.find((brief) => String(brief.brief_date || "") === today) || briefs[0] || null;
  const activeItems = items.filter((item) => !["done", "published", "dropped"].includes(String(item.status || "").toLowerCase()));
  const blockers = items.filter((item) => item.is_blocking || String(item.status || "").toLowerCase() === "blocked");
  const readyItems = items.filter((item) => ["ready", "done", "published"].includes(String(item.status || "").toLowerCase()));

  let score = 70;
  if (todayBrief) score += 10;
  if (blockers.length === 0) score += 10;
  if (readyItems.length > 0) score += 10;
  if (activeItems.length > 8) score -= 10;
  if (blockers.length > 0) score -= 20;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, briefs, items, todayBrief, activeItems, blockers, readyItems };
}
