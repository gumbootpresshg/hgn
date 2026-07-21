import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function shiftToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  if (tone === "blue") return "border-blue-200 bg-blue-50 text-blue-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function toneForShiftItem(item: Row) {
  const status = String(item.shift_status || "").toLowerCase();
  const priority = String(item.priority || "").toLowerCase();
  if (status === "blocked" || priority === "urgent") return "bad";
  if (priority === "high" || status === "waiting") return "warn";
  if (item.is_done || status === "done") return "good";
  if (status === "watching") return "blue";
  return "neutral";
}

export async function getShiftCenterSnapshot() {
  const [items, notes, checks] = await Promise.all([
    safeSelect("shift_center_items", "sort_order", true, 100),
    safeSelect("shift_center_notes", "updated_at", false, 20),
    safeSelect("shift_center_checks", "sort_order", true, 50),
  ]);

  const active = items.filter((item) => !item.is_done && !["done", "dropped"].includes(String(item.shift_status || "").toLowerCase()));
  const blocked = items.filter((item) => String(item.shift_status || "").toLowerCase() === "blocked" || String(item.priority || "").toLowerCase() === "urgent");
  const watching = items.filter((item) => String(item.shift_status || "").toLowerCase() === "watching");
  const readyChecks = checks.filter((check) => Boolean(check.is_ready)).length;
  const checkScore = checks.length ? Math.round((readyChecks / checks.length) * 100) : 70;

  let score = checkScore;
  if (active.length <= 5) score += 8;
  if (blocked.length > 0) score -= 25;
  if (watching.length > 0) score -= 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, items, notes, checks, active, blocked, watching };
}
