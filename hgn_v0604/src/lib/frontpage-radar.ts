import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function frontpageRadarTone(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  if (tone === "blue") return "border-blue-200 bg-blue-50 text-blue-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function toneForFrontpageItem(item: Row) {
  const status = String(item.item_status || "").toLowerCase();
  const severity = String(item.severity || "").toLowerCase();
  const area = String(item.item_area || "").toLowerCase();

  if (["done", "cleared", "fixed"].includes(status)) return "good";
  if (["blocked", "urgent"].includes(status) || severity === "urgent") return "bad";
  if (severity === "needs-look" || area === "hero") return "warn";
  if (area === "media" || area === "balance") return "blue";
  return "neutral";
}

export async function getFrontpageRadarSnapshot() {
  const [items, checks, runs] = await Promise.all([
    safeSelect("frontpage_radar_items", "sort_order", true, 100),
    safeSelect("frontpage_radar_checks", "sort_order", true, 50),
    safeSelect("frontpage_radar_runs", "created_at", false, 10),
  ]);

  const open = items.filter((item) => !["done", "cleared", "fixed", "dropped"].includes(String(item.item_status || "").toLowerCase()));
  const cleared = items.filter((item) => ["done", "cleared", "fixed"].includes(String(item.item_status || "").toLowerCase()));
  const urgent = open.filter((item) => ["urgent", "blocked"].includes(String(item.item_status || "").toLowerCase()) || String(item.severity || "").toLowerCase() === "urgent");
  const hero = open.filter((item) => String(item.item_area || "").toLowerCase() === "hero");
  const completedChecks = checks.filter((check) => ["done", "cleared", "fixed"].includes(String(check.check_status || "").toLowerCase())).length;
  const checkScore = checks.length ? Math.round((completedChecks / checks.length) * 100) : 75;

  let score = Math.max(60, checkScore || 75);
  if (cleared.length) score += Math.min(15, cleared.length * 4);
  if (open.length > 4) score -= 8;
  if (hero.length) score -= 8;
  if (urgent.length) score -= Math.min(35, urgent.length * 15);
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, items, checks, runs, open, cleared, urgent, hero };
}
