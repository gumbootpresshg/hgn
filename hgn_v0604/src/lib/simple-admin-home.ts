import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function simpleHomeTone(status: string, group?: string) {
  const value = String(status || "").toLowerCase();
  const kind = String(group || "").toLowerCase();
  if (value === "active" && kind === "primary") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (value === "active") return "border-blue-200 bg-blue-50 text-blue-950";
  if (["review", "cleanup"].includes(value)) return "border-amber-200 bg-amber-50 text-amber-950";
  if (["parked", "hidden"].includes(value) || kind === "parked") return "border-slate-200 bg-slate-50 text-slate-700";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getSimpleAdminHomeSnapshot() {
  const [cards, notes] = await Promise.all([
    safeSelect("simple_admin_home_cards", "sort_order", true, 120),
    safeSelect("simple_admin_home_notes", "created_at", false, 20),
  ]);

  const primary = cards.filter((card) => String(card.card_group || "").toLowerCase() === "primary");
  const cleanup = cards.filter((card) => String(card.card_group || "").toLowerCase() === "cleanup");
  const occasional = cards.filter((card) => String(card.card_group || "").toLowerCase() === "occasional");
  const parked = cards.filter((card) => ["parked", "hidden"].includes(String(card.card_group || "").toLowerCase()) || ["parked", "hidden"].includes(String(card.card_status || "").toLowerCase()));

  let score = 82;
  score += Math.min(primary.length, 6) * 2;
  score += cleanup.length * 2;
  score += parked.length * 4;
  score -= Math.max(0, primary.length - 6) * 5;
  score -= occasional.length;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { cards, notes, primary, cleanup, occasional, parked, score };
}
