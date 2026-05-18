import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function cleanupToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  if (tone === "blue") return "border-blue-200 bg-blue-50 text-blue-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function toneForCleanupItem(item: Row) {
  const status = String(item.cleanup_status || "").toLowerCase();
  const priority = String(item.priority || "").toLowerCase();
  if (status === "blocked" || priority === "urgent") return "bad";
  if (priority === "high" || status === "needs review") return "warn";
  if (item.is_done || status === "done") return "good";
  if (status === "waiting") return "blue";
  return "neutral";
}

export async function getCleanupDeskSnapshot() {
  const [items, sweeps] = await Promise.all([
    safeSelect("cleanup_desk_items", "sort_order", true, 100),
    safeSelect("cleanup_desk_sweeps", "sort_order", true, 50),
  ]);

  const active = items.filter((item) => !item.is_done && !["done", "dropped"].includes(String(item.cleanup_status || "").toLowerCase()));
  const blocked = items.filter((item) => String(item.cleanup_status || "").toLowerCase() === "blocked" || String(item.priority || "").toLowerCase() === "urgent");
  const review = items.filter((item) => String(item.cleanup_status || "").toLowerCase() === "needs review");
  const completeSweeps = sweeps.filter((sweep) => Boolean(sweep.is_complete)).length;
  const sweepScore = sweeps.length ? Math.round((completeSweeps / sweeps.length) * 100) : 75;

  let score = sweepScore;
  if (active.length <= 6) score += 8;
  if (review.length > 0) score -= 8;
  if (blocked.length > 0) score -= 25;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, items, sweeps, active, blocked, review };
}
