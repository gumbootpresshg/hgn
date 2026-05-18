import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function staleToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  if (tone === "blue") return "border-blue-200 bg-blue-50 text-blue-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function toneForStaleItem(item: Row) {
  const status = String(item.item_status || "").toLowerCase();
  const area = String(item.item_area || "").toLowerCase();
  const age = Number(item.age_hours || 0);

  if (status === "fixed" || status === "cleared" || status === "done") return "good";
  if (status === "blocked") return "bad";
  if (age >= 24 || area === "homepage") return "bad";
  if (age >= 8 || status === "review") return "warn";
  if (area === "draft" || area === "media") return "blue";
  return "neutral";
}

export async function getStaleCheckSnapshot() {
  const [items, rules, runs] = await Promise.all([
    safeSelect("stale_check_items", "sort_order", true, 100),
    safeSelect("stale_check_rules", "sort_order", true, 50),
    safeSelect("stale_check_runs", "created_at", false, 10),
  ]);

  const active = items.filter((item) => !["fixed", "cleared", "done", "dropped"].includes(String(item.item_status || "").toLowerCase()));
  const fixed = items.filter((item) => ["fixed", "cleared", "done"].includes(String(item.item_status || "").toLowerCase()));
  const urgent = active.filter((item) => Number(item.age_hours || 0) >= 24 || String(item.item_area || "").toLowerCase() === "homepage");
  const review = active.filter((item) => String(item.item_status || "").toLowerCase() === "review");
  const readyRules = rules.filter((rule) => Boolean(rule.is_enabled)).length;
  const ruleScore = rules.length ? Math.round((readyRules / rules.length) * 100) : 75;

  let score = ruleScore;
  if (fixed.length) score += Math.min(15, fixed.length * 3);
  if (active.length > 5) score -= 10;
  if (review.length) score -= 4;
  if (urgent.length) score -= Math.min(35, urgent.length * 12);
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, items, rules, runs, active, fixed, urgent, review };
}
