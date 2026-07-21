import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

const readyStatuses = new Set(["done", "ready", "passed", "locked", "verified", "complete", "clean", "green"]);
const blockedStatuses = new Set(["blocked", "failed", "missing", "broken", "risk", "open", "red"]);

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function onlineSoftBetaTone(status: string, priority = "medium") {
  const value = String(status || "").toLowerCase();
  const level = String(priority || "medium").toLowerCase();
  if (readyStatuses.has(value)) return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (blockedStatuses.has(value)) return "border-red-200 bg-red-50 text-red-950";
  if (level === "critical") return "border-orange-200 bg-orange-50 text-orange-950";
  return "border-slate-200 bg-white text-slate-950";
}

function scoreRows(rows: Row[]) {
  if (!rows.length) return 90;
  let earned = 0;
  let possible = 0;

  for (const row of rows) {
    const status = String(row.status || "").toLowerCase();
    const priority = String(row.priority || "medium").toLowerCase();
    const weight = priority === "critical" ? 2 : priority === "high" ? 1.5 : 1;
    possible += weight;
    if (readyStatuses.has(status)) earned += weight;
    else if (blockedStatuses.has(status)) earned += 0;
    else earned += weight * 0.58;
  }

  return Math.max(0, Math.min(100, Math.round((earned / possible) * 100)));
}

export async function getOnlineSoftBetaSnapshot() {
  const [gates, routeChecks, deploymentChecks, notes] = await Promise.all([
    safeSelect("online_soft_beta_gates", "sort_order", true, 100),
    safeSelect("online_soft_beta_route_checks", "sort_order", true, 100),
    safeSelect("online_soft_beta_deployment_checks", "sort_order", true, 100),
    safeSelect("online_soft_beta_notes", "created_at", false, 30),
  ]);

  const all = [...gates, ...routeChecks, ...deploymentChecks];
  const blockers = all.filter((row) => blockedStatuses.has(String(row.status || "").toLowerCase()));
  const criticalOpen = all.filter((row) => String(row.priority || "").toLowerCase() === "critical" && !readyStatuses.has(String(row.status || "").toLowerCase()));
  const score = scoreRows(all);
  const recommendation = blockers.length === 0 && criticalOpen.length === 0 && score >= 94 ? "candidate for controlled online beta" : "finish critical checks before opening the beta link";

  return { gates, routeChecks, deploymentChecks, notes, blockers, criticalOpen, score, recommendation };
}
