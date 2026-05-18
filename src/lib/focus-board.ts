import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function focusToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  if (tone === "blue") return "border-blue-200 bg-blue-50 text-blue-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function toneForFocusItem(item: Row) {
  const status = String(item.item_status || "").toLowerCase();
  const area = String(item.focus_area || "").toLowerCase();
  const priority = Number(item.priority || 3);
  if (status === "blocked") return "bad";
  if (status === "done" || status === "ready") return "good";
  if (priority <= 1 || area === "lead_story" || area === "homepage") return "blue";
  if (status === "open" || status === "waiting") return "warn";
  return "neutral";
}

export async function getFocusBoardSnapshot() {
  const [items, checks] = await Promise.all([
    safeSelect("focus_board_items", "sort_order", true, 100),
    safeSelect("focus_board_checks", "sort_order", true, 50),
  ]);

  const open = items.filter((item) => !["done", "dropped"].includes(String(item.item_status || "").toLowerCase()));
  const done = items.filter((item) => String(item.item_status || "").toLowerCase() === "done");
  const blockers = items.filter((item) => String(item.item_status || "").toLowerCase() === "blocked");
  const topPriority = items.filter((item) => Number(item.priority || 3) <= 1);
  const homepage = items.filter((item) => String(item.focus_area || "").toLowerCase() === "homepage");
  const readyChecks = checks.filter((check) => Boolean(check.is_ready)).length;
  const checkScore = checks.length ? Math.round((readyChecks / checks.length) * 100) : 70;

  let score = checkScore;
  if (topPriority.length) score += 10;
  if (homepage.length) score += 8;
  if (done.length >= 2) score += 8;
  if (open.length > 5) score -= 10;
  if (blockers.length) score -= 22;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, items, checks, open, done, blockers, topPriority, homepage };
}
