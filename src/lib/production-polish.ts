import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function polishTone(status: string) {
  const value = String(status || "").toLowerCase();
  if (["done", "passed", "ready", "green"].includes(value)) return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (["working", "review", "watch", "yellow"].includes(value)) return "border-amber-200 bg-amber-50 text-amber-950";
  if (["blocked", "failed", "red"].includes(value)) return "border-red-200 bg-red-50 text-red-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function polishScore(checks: Row[], routes: Row[]) {
  const rows = [...checks, ...routes];
  if (!rows.length) return 78;

  const total = rows.reduce((sum, row) => {
    const status = String(row.status || "").toLowerCase();
    if (["done", "passed", "ready", "green"].includes(status)) return sum + 1;
    if (["working", "review", "watch", "yellow"].includes(status)) return sum + 0.55;
    if (["blocked", "failed", "red"].includes(status)) return sum - 0.25;
    return sum + 0.25;
  }, 0);

  return Math.max(0, Math.min(100, Math.round((total / rows.length) * 100)));
}

export async function getProductionPolishSnapshot() {
  const [checks, routes, notes] = await Promise.all([
    safeSelect("production_polish_checks", "sort_order", true, 100),
    safeSelect("production_route_reviews", "sort_order", true, 100),
    safeSelect("production_soft_beta_notes", "created_at", false, 20),
  ]);

  const blockers = [...checks, ...routes].filter((row) => ["blocked", "failed", "red"].includes(String(row.status || "").toLowerCase()));
  const highPriority = checks.filter((row) => String(row.priority || "").toLowerCase() === "high");
  const score = polishScore(checks, routes);

  return { checks, routes, notes, blockers, highPriority, score };
}
