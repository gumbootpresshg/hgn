import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

const readyStatuses = new Set(["done", "ready", "fixed", "passed", "clean", "complete", "verified"]);
const blockedStatuses = new Set(["blocked", "failed", "error", "missing", "broken"]);

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function launchFixTone(status: string, severity = "medium") {
  const value = String(status || "").toLowerCase();
  const level = String(severity || "medium").toLowerCase();
  if (readyStatuses.has(value)) return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (blockedStatuses.has(value)) return "border-red-200 bg-red-50 text-red-950";
  if (level === "critical") return "border-orange-200 bg-orange-50 text-orange-950";
  return "border-slate-200 bg-white text-slate-950";
}

function scoreRows(rows: Row[]) {
  if (!rows.length) return 88;
  let earned = 0;
  let possible = 0;
  for (const row of rows) {
    const status = String(row.status || "").toLowerCase();
    const severity = String(row.severity || "medium").toLowerCase();
    const weight = severity === "critical" ? 2 : severity === "high" ? 1.5 : 1;
    possible += weight;
    if (readyStatuses.has(status)) earned += weight;
    else if (blockedStatuses.has(status)) earned += 0;
    else earned += weight * 0.55;
  }
  return Math.max(0, Math.min(100, Math.round((earned / possible) * 100)));
}

export async function getLaunchFixPackSnapshot() {
  const [fixes, sqlGuards, routeChecks, notes] = await Promise.all([
    safeSelect("launch_fix_pack_items", "sort_order", true, 100),
    safeSelect("launch_fix_sql_guards", "sort_order", true, 100),
    safeSelect("launch_fix_route_checks", "sort_order", true, 100),
    safeSelect("launch_fix_notes", "created_at", false, 20),
  ]);
  const all = [...fixes, ...sqlGuards, ...routeChecks];
  const blockers = all.filter((row) => blockedStatuses.has(String(row.status || "").toLowerCase()));
  const criticalOpen = all.filter((row) => String(row.severity || "").toLowerCase() === "critical" && !readyStatuses.has(String(row.status || "").toLowerCase()));
  const score = scoreRows(all);
  const recommendation = blockers.length === 0 && criticalOpen.length === 0 && score >= 92 ? "safe to continue deployment" : "finish fix pack checks";
  return { fixes, sqlGuards, routeChecks, notes, blockers, criticalOpen, score, recommendation };
}
