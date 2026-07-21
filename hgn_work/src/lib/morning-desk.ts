import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function morningToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  if (tone === "blue") return "border-blue-200 bg-blue-50 text-blue-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function toneForMorningItem(item: Row) {
  const status = String(item.item_status || "").toLowerCase();
  const lane = String(item.lane || "").toLowerCase();
  if (status === "blocked") return "bad";
  if (status === "needs_review" || status === "waiting") return "warn";
  if (status === "done" || status === "ready") return "good";
  if (lane === "lead" || lane === "homepage") return "blue";
  return "neutral";
}

export async function getMorningDeskSnapshot() {
  const [items, checks] = await Promise.all([
    safeSelect("morning_desk_items", "sort_order", true, 100),
    safeSelect("morning_desk_checks", "sort_order", true, 50),
  ]);

  const open = items.filter((item) => !["done", "dropped"].includes(String(item.item_status || "").toLowerCase()));
  const done = items.filter((item) => String(item.item_status || "").toLowerCase() === "done");
  const ready = items.filter((item) => ["ready", "done"].includes(String(item.item_status || "").toLowerCase()));
  const blockers = items.filter((item) => String(item.item_status || "").toLowerCase() === "blocked");
  const lead = items.find((item) => String(item.lane || "").toLowerCase() === "lead");
  const readyChecks = checks.filter((check) => Boolean(check.is_ready)).length;
  const checkScore = checks.length ? Math.round((readyChecks / checks.length) * 100) : 70;

  let score = checkScore;
  if (lead) score += 8;
  if (ready.length >= 3) score += 8;
  if (open.length > 0 && open.length <= 7) score += 4;
  if (open.length > 10) score -= 10;
  if (blockers.length) score -= 25;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, items, checks, open, done, ready, blockers, lead };
}
