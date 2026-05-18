import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

const readyStatuses = new Set(["done", "ready", "passed", "green"]);
const watchStatuses = new Set(["review", "working", "watch", "yellow", "todo"]);
const blockedStatuses = new Set(["blocked", "failed", "red"]);

export function hardeningTone(status: string, severity = "medium") {
  const value = String(status || "").toLowerCase();
  const level = String(severity || "").toLowerCase();
  if (readyStatuses.has(value)) return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (blockedStatuses.has(value)) return "border-red-200 bg-red-50 text-red-950";
  if (level === "critical") return "border-orange-200 bg-orange-50 text-orange-950";
  if (watchStatuses.has(value)) return "border-amber-200 bg-amber-50 text-amber-950";
  return "border-slate-200 bg-white text-slate-900";
}

function scoreRows(rows: Row[]) {
  if (!rows.length) return 76;
  const total = rows.reduce((sum, row) => {
    const status = String(row.status || "").toLowerCase();
    const severity = String(row.severity || "medium").toLowerCase();
    const weight = severity === "critical" ? 1.4 : severity === "high" ? 1.15 : 1;

    if (readyStatuses.has(status)) return sum + weight;
    if (watchStatuses.has(status)) return sum + weight * 0.52;
    if (blockedStatuses.has(status)) return sum - weight * 0.35;
    return sum + weight * 0.25;
  }, 0);
  const max = rows.reduce((sum, row) => {
    const severity = String(row.severity || "medium").toLowerCase();
    return sum + (severity === "critical" ? 1.4 : severity === "high" ? 1.15 : 1);
  }, 0);
  return Math.max(0, Math.min(100, Math.round((total / max) * 100)));
}

export async function getOnlineBetaHardeningSnapshot() {
  const [checks, routes, steps, decisions] = await Promise.all([
    safeSelect("online_beta_hardening_checks", "sort_order", true, 100),
    safeSelect("online_beta_route_smoke_tests", "sort_order", true, 100),
    safeSelect("online_beta_rollout_steps", "sort_order", true, 100),
    safeSelect("online_beta_decision_log", "created_at", false, 20),
  ]);

  const allReviewRows = [...checks, ...routes, ...steps];
  const blockers = allReviewRows.filter((row) => blockedStatuses.has(String(row.status || "").toLowerCase()));
  const criticalOpen = checks.filter((row) => String(row.severity || "").toLowerCase() === "critical" && !readyStatuses.has(String(row.status || "").toLowerCase()));
  const todoSteps = steps.filter((row) => !readyStatuses.has(String(row.status || "").toLowerCase()));
  const score = scoreRows(allReviewRows);

  return { checks, routes, steps, decisions, blockers, criticalOpen, todoSteps, score };
}
