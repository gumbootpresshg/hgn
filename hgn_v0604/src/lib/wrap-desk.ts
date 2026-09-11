import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function wrapToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  if (tone === "blue") return "border-blue-200 bg-blue-50 text-blue-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function toneForWrapItem(item: Row) {
  const status = String(item.item_status || "").toLowerCase();
  const lane = String(item.lane || "").toLowerCase();
  if (status === "blocked" || status === "carry_forward") return "bad";
  if (status === "open" || status === "waiting") return "warn";
  if (status === "done" || status === "ready") return "good";
  if (lane === "tomorrow" || lane === "handoff") return "blue";
  return "neutral";
}

export async function getWrapDeskSnapshot() {
  const [items, checks] = await Promise.all([
    safeSelect("wrap_desk_items", "sort_order", true, 100),
    safeSelect("wrap_desk_checks", "sort_order", true, 50),
  ]);

  const open = items.filter((item) => !["done", "dropped"].includes(String(item.item_status || "").toLowerCase()));
  const done = items.filter((item) => String(item.item_status || "").toLowerCase() === "done");
  const carryForward = items.filter((item) => String(item.item_status || "").toLowerCase() === "carry_forward");
  const blockers = items.filter((item) => String(item.item_status || "").toLowerCase() === "blocked");
  const tomorrow = items.filter((item) => String(item.lane || "").toLowerCase() === "tomorrow");
  const readyChecks = checks.filter((check) => Boolean(check.is_ready)).length;
  const checkScore = checks.length ? Math.round((readyChecks / checks.length) * 100) : 70;

  let score = checkScore;
  if (done.length >= 2) score += 8;
  if (tomorrow.length) score += 8;
  if (open.length > 6) score -= 10;
  if (carryForward.length > 3) score -= 8;
  if (blockers.length) score -= 20;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, items, checks, open, done, carryForward, blockers, tomorrow };
}
