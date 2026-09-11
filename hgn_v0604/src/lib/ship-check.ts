import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function shipToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  if (tone === "blue") return "border-blue-200 bg-blue-50 text-blue-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function toneForShipItem(item: Row) {
  const status = String(item.check_status || "").toLowerCase();
  const area = String(item.check_area || "").toLowerCase();
  const priority = Number(item.priority || 3);

  if (status === "blocked" || status === "fail") return "bad";
  if (status === "done" || status === "ready" || status === "pass") return "good";
  if (priority <= 1 || area === "homepage" || area === "mobile") return "blue";
  if (status === "open" || status === "review") return "warn";
  return "neutral";
}

export async function getShipCheckSnapshot() {
  const [items, runs, checks] = await Promise.all([
    safeSelect("ship_check_items", "sort_order", true, 100),
    safeSelect("ship_check_runs", "created_at", false, 10),
    safeSelect("ship_check_checks", "sort_order", true, 50),
  ]);

  const open = items.filter((item) => !["done", "dropped", "pass"].includes(String(item.check_status || "").toLowerCase()));
  const done = items.filter((item) => ["done", "pass", "ready"].includes(String(item.check_status || "").toLowerCase()));
  const blockers = items.filter((item) => ["blocked", "fail"].includes(String(item.check_status || "").toLowerCase()));
  const topPriority = items.filter((item) => Number(item.priority || 3) <= 1);
  const readyChecks = checks.filter((check) => Boolean(check.is_ready)).length;
  const checkScore = checks.length ? Math.round((readyChecks / checks.length) * 100) : 70;

  let score = checkScore;
  if (done.length) score += Math.min(16, done.length * 4);
  if (topPriority.length) score += 8;
  if (open.length > 4) score -= 8;
  if (blockers.length) score -= 28;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, items, runs, checks, open, done, blockers, topPriority };
}
