import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function betaFreezeTone(status: string, kind?: string) {
  const value = String(status || "").toLowerCase();
  const group = String(kind || "").toLowerCase();
  if (["done", "frozen", "ready"].includes(value)) return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (["now", "active", "primary"].includes(value)) return "border-blue-200 bg-blue-50 text-blue-950";
  if (["risk", "review", "cleanup"].includes(value) || group === "cleanup") return "border-amber-200 bg-amber-50 text-amber-950";
  if (["parked", "later", "hidden"].includes(value)) return "border-slate-200 bg-slate-50 text-slate-700";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getBetaFreezeSnapshot() {
  const [items, routes, notes] = await Promise.all([
    safeSelect("beta_freeze_items", "sort_order", true, 80),
    safeSelect("beta_freeze_routes", "sort_order", true, 80),
    safeSelect("beta_freeze_notes", "created_at", false, 20),
  ]);

  const blockers = items.filter((item) => ["risk", "blocked", "review"].includes(String(item.item_status || "").toLowerCase()));
  const ready = items.filter((item) => ["done", "ready", "frozen"].includes(String(item.item_status || "").toLowerCase()));
  const primaryRoutes = routes.filter((route) => String(route.route_status || "").toLowerCase() === "primary");
  const parkedRoutes = routes.filter((route) => ["parked", "later", "hidden"].includes(String(route.route_status || "").toLowerCase()));
  const activeNotes = notes.filter((note) => String(note.note_status || "").toLowerCase() !== "closed");

  let score = 70;
  score += Math.min(ready.length, 8) * 4;
  score += Math.min(primaryRoutes.length, 4) * 3;
  score += Math.min(parkedRoutes.length, 10) * 2;
  score -= blockers.length * 10;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { items, routes, notes, blockers, ready, primaryRoutes, parkedRoutes, activeNotes, score };
}
