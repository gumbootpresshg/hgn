import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function todayBoardToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  if (tone === "blue") return "border-blue-200 bg-blue-50 text-blue-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function toneForTodayItem(item: Row) {
  const status = String(item.status || "").toLowerCase();
  const priority = String(item.priority || "").toLowerCase();
  if (status === "blocked" || priority === "urgent") return "bad";
  if (status === "waiting" || priority === "high") return "warn";
  if (status === "done" || status === "published") return "good";
  if (item.item_type === "lead" || item.item_type === "homepage") return "blue";
  return "neutral";
}

export async function getTodayBoardSnapshot() {
  const [items, coreTasks, publishItems, homepageSlots, handoffs] = await Promise.all([
    safeSelect("today_board_items", "sort_order", true, 100),
    safeSelect("beta_ready_core_tasks", "sort_order", true, 60),
    safeSelect("publish_sweep_items", "sort_order", true, 60),
    safeSelect("homepage_focus_slots", "sort_order", true, 20),
    safeSelect("handoff_notes", "updated_at", false, 12),
  ]);

  const openItems = items.filter((item) => !["done", "published", "dropped"].includes(String(item.status || "").toLowerCase()));
  const blockedItems = items.filter((item) => ["blocked", "needs_fix"].includes(String(item.status || "").toLowerCase()) || String(item.priority || "").toLowerCase() === "urgent");
  const doneItems = items.filter((item) => ["done", "published"].includes(String(item.status || "").toLowerCase()));
  const leadItems = items.filter((item) => String(item.item_type || "") === "lead");
  const homepageItems = items.filter((item) => String(item.item_type || "") === "homepage");

  let score = 72;
  if (openItems.length <= 6) score += 8;
  if (leadItems.length > 0) score += 8;
  if (homepageItems.length > 0 || homepageSlots.length > 0) score += 7;
  if (doneItems.length > 0) score += 5;
  if (blockedItems.length > 0) score -= 25;
  if (openItems.length > 10) score -= 10;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    items,
    openItems,
    blockedItems,
    doneItems,
    leadItems,
    homepageItems,
    coreTasks,
    publishItems,
    homepageSlots,
    handoffs,
  };
}
