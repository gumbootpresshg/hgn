import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function launchCleanupTone(status: string) {
  const value = String(status || "").toLowerCase();
  if (["done", "clean", "ready"].includes(value)) return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (["today", "active", "review"].includes(value)) return "border-blue-200 bg-blue-50 text-blue-950";
  if (["blocked", "messy", "urgent"].includes(value)) return "border-rose-200 bg-rose-50 text-rose-950";
  if (["parked", "later", "hidden"].includes(value)) return "border-slate-200 bg-slate-50 text-slate-700";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getLaunchCleanupSnapshot() {
  const [items, routes, notes] = await Promise.all([
    safeSelect("launch_cleanup_items", "sort_order", true, 80),
    safeSelect("launch_cleanup_routes", "sort_order", true, 40),
    safeSelect("launch_cleanup_notes", "created_at", false, 20),
  ]);

  const activeItems = items.filter((item) => ["today", "active", "review"].includes(String(item.item_status || "").toLowerCase()));
  const blockedItems = items.filter((item) => ["blocked", "messy", "urgent"].includes(String(item.item_status || "").toLowerCase()));
  const doneItems = items.filter((item) => ["done", "clean", "ready"].includes(String(item.item_status || "").toLowerCase()));
  const hiddenRoutes = routes.filter((route) => ["hidden", "parked"].includes(String(route.route_status || "").toLowerCase()));

  let score = 84;
  score += doneItems.length * 3;
  score += hiddenRoutes.length * 2;
  score -= activeItems.length * 2;
  score -= blockedItems.length * 10;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { items, routes, notes, activeItems, blockedItems, doneItems, hiddenRoutes, score };
}
