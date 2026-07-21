import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

const readyStatuses = new Set(["done", "ready", "passed", "green", "live", "locked"]);
const blockedStatuses = new Set(["blocked", "failed", "red", "missing"]);
const reviewStatuses = new Set(["review", "working", "watch", "yellow", "todo", "open"]);

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function betaLaunchGateTone(status: string, severity = "medium") {
  const value = String(status || "").toLowerCase();
  const level = String(severity || "medium").toLowerCase();
  if (readyStatuses.has(value)) return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (blockedStatuses.has(value)) return "border-red-200 bg-red-50 text-red-950";
  if (level === "critical") return "border-orange-200 bg-orange-50 text-orange-950";
  if (reviewStatuses.has(value)) return "border-amber-200 bg-amber-50 text-amber-950";
  return "border-slate-200 bg-white text-slate-900";
}

function scoreRows(rows: Row[]) {
  if (!rows.length) return 82;
  let earned = 0;
  let possible = 0;

  for (const row of rows) {
    const status = String(row.status || "").toLowerCase();
    const severity = String(row.severity || "medium").toLowerCase();
    const weight = severity === "critical" ? 1.8 : severity === "high" ? 1.35 : 1;
    possible += weight;

    if (readyStatuses.has(status)) earned += weight;
    else if (reviewStatuses.has(status)) earned += weight * 0.55;
    else if (blockedStatuses.has(status)) earned -= weight * 0.25;
    else earned += weight * 0.35;
  }

  return Math.max(0, Math.min(100, Math.round((earned / possible) * 100)));
}

export async function getBetaLaunchGateSnapshot() {
  const [gates, routes, checks, notes] = await Promise.all([
    safeSelect("beta_launch_gates", "sort_order", true, 100),
    safeSelect("beta_launch_public_routes", "sort_order", true, 100),
    safeSelect("beta_launch_final_checks", "sort_order", true, 100),
    safeSelect("beta_launch_notes", "created_at", false, 30),
  ]);

  const allRows = [...gates, ...routes, ...checks];
  const blockers = allRows.filter((row) => blockedStatuses.has(String(row.status || "").toLowerCase()));
  const criticalOpen = allRows.filter((row) => {
    const severity = String(row.severity || "").toLowerCase();
    const status = String(row.status || "").toLowerCase();
    return severity === "critical" && !readyStatuses.has(status);
  });
  const reviewItems = allRows.filter((row) => reviewStatuses.has(String(row.status || "").toLowerCase()));
  const score = scoreRows(allRows);
  const goLiveRecommendation = blockers.length === 0 && criticalOpen.length <= 1 && score >= 86 ? "soft-beta ready" : "keep hardening";

  return { gates, routes, checks, notes, blockers, criticalOpen, reviewItems, score, goLiveRecommendation };
}
