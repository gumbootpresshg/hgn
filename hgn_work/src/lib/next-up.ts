import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function nextUpTone(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  if (tone === "blue") return "border-blue-200 bg-blue-50 text-blue-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function toneForNextUp(item: Row) {
  const status = String(item.item_status || "").toLowerCase();
  const lane = String(item.lane || "").toLowerCase();
  const urgency = String(item.urgency || "").toLowerCase();

  if (["done", "published", "moved"].includes(status)) return "good";
  if (["blocked", "stuck"].includes(status) || urgency === "urgent") return "bad";
  if (["ready", "next"].includes(status)) return "blue";
  if (lane === "frontpage" || urgency === "soon") return "warn";
  return "neutral";
}

export async function getNextUpSnapshot() {
  const [items, checks, notes] = await Promise.all([
    safeSelect("next_up_items", "sort_order", true, 100),
    safeSelect("next_up_checks", "sort_order", true, 50),
    safeSelect("next_up_notes", "created_at", false, 20),
  ]);

  const open = items.filter((item) => !["done", "published", "moved", "dropped"].includes(String(item.item_status || "").toLowerCase()));
  const ready = open.filter((item) => ["ready", "next"].includes(String(item.item_status || "").toLowerCase()));
  const blocked = open.filter((item) => ["blocked", "stuck"].includes(String(item.item_status || "").toLowerCase()) || String(item.urgency || "").toLowerCase() === "urgent");
  const frontpage = open.filter((item) => String(item.lane || "").toLowerCase() === "frontpage");
  const doneChecks = checks.filter((check) => ["done", "clear"].includes(String(check.check_status || "").toLowerCase())).length;
  const checkScore = checks.length ? Math.round((doneChecks / checks.length) * 100) : 76;

  let score = Math.max(55, checkScore || 76);
  if (ready.length) score += Math.min(14, ready.length * 4);
  if (frontpage.length) score += 4;
  if (open.length > 5) score -= 8;
  if (blocked.length) score -= Math.min(35, blocked.length * 14);
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, items, checks, notes, open, ready, blocked, frontpage };
}
