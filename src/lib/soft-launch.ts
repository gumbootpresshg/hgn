import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

const readyStatuses = new Set(["done", "ready", "passed", "green", "live"]);
const blockedStatuses = new Set(["blocked", "failed", "red"]);
const watchStatuses = new Set(["review", "working", "watch", "yellow", "todo"]);

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function softLaunchTone(status: string, severity = "medium") {
  const value = String(status || "").toLowerCase();
  const level = String(severity || "").toLowerCase();
  if (readyStatuses.has(value)) return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (blockedStatuses.has(value)) return "border-red-200 bg-red-50 text-red-950";
  if (level === "critical") return "border-orange-200 bg-orange-50 text-orange-950";
  if (watchStatuses.has(value)) return "border-amber-200 bg-amber-50 text-amber-950";
  return "border-slate-200 bg-white text-slate-900";
}

function scoreRows(rows: Row[]) {
  if (!rows.length) return 82;
  let earned = 0;
  let possible = 0;
  for (const row of rows) {
    const status = String(row.status || "").toLowerCase();
    const severity = String(row.severity || "medium").toLowerCase();
    const weight = severity === "critical" ? 1.5 : severity === "high" ? 1.2 : 1;
    possible += weight;
    if (readyStatuses.has(status)) earned += weight;
    else if (watchStatuses.has(status)) earned += weight * 0.55;
    else if (blockedStatuses.has(status)) earned -= weight * 0.25;
    else earned += weight * 0.3;
  }
  return Math.max(0, Math.min(100, Math.round((earned / possible) * 100)));
}

export async function getSoftLaunchSnapshot() {
  const [checks, routes, polish, deploy, notes] = await Promise.all([
    safeSelect("soft_launch_checks", "sort_order", true, 100),
    safeSelect("soft_launch_route_checks", "sort_order", true, 100),
    safeSelect("soft_launch_polish_items", "sort_order", true, 100),
    safeSelect("soft_launch_deployment_steps", "sort_order", true, 100),
    safeSelect("soft_launch_notes", "created_at", false, 30),
  ]);

  const allRows = [...checks, ...routes, ...polish, ...deploy];
  const blockers = allRows.filter((row) => blockedStatuses.has(String(row.status || "").toLowerCase()));
  const watchItems = allRows.filter((row) => watchStatuses.has(String(row.status || "").toLowerCase()));
  const criticalOpen = allRows.filter((row) => {
    const severity = String(row.severity || "").toLowerCase();
    const status = String(row.status || "").toLowerCase();
    return severity === "critical" && !readyStatuses.has(status);
  });
  const score = scoreRows(allRows);

  return { checks, routes, polish, deploy, notes, blockers, watchItems, criticalOpen, score };
}
