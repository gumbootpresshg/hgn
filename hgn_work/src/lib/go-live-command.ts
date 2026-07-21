import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

const readyStatuses = new Set(["done", "ready", "passed", "green", "live", "locked", "confirmed"]);
const blockedStatuses = new Set(["blocked", "failed", "red", "missing", "not ready"]);
const reviewStatuses = new Set(["review", "working", "watch", "yellow", "todo", "open", "checking"]);

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function goLiveTone(status: string, severity = "medium") {
  const value = String(status || "").toLowerCase();
  const level = String(severity || "medium").toLowerCase();
  if (readyStatuses.has(value)) return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (blockedStatuses.has(value)) return "border-red-200 bg-red-50 text-red-950";
  if (level === "critical") return "border-orange-200 bg-orange-50 text-orange-950";
  if (reviewStatuses.has(value)) return "border-amber-200 bg-amber-50 text-amber-950";
  return "border-slate-200 bg-white text-slate-900";
}

function weightedScore(rows: Row[]) {
  if (!rows.length) return 88;
  let earned = 0;
  let possible = 0;

  for (const row of rows) {
    const status = String(row.status || "").toLowerCase();
    const severity = String(row.severity || "medium").toLowerCase();
    const weight = severity === "critical" ? 2.2 : severity === "high" ? 1.5 : 1;
    possible += weight;

    if (readyStatuses.has(status)) earned += weight;
    else if (reviewStatuses.has(status)) earned += weight * 0.55;
    else if (blockedStatuses.has(status)) earned -= weight * 0.25;
    else earned += weight * 0.35;
  }

  return Math.max(0, Math.min(100, Math.round((earned / possible) * 100)));
}

export async function getGoLiveCommandSnapshot() {
  const [checks, routes, handoff, env] = await Promise.all([
    safeSelect("go_live_command_checks", "sort_order", true, 100),
    safeSelect("go_live_route_checks", "sort_order", true, 100),
    safeSelect("go_live_handoff_notes", "created_at", false, 20),
    safeSelect("go_live_environment_items", "sort_order", true, 100),
  ]);

  const allRows = [...checks, ...routes, ...env];
  const blockers = allRows.filter((row) => blockedStatuses.has(String(row.status || "").toLowerCase()));
  const criticalOpen = allRows.filter((row) => {
    const status = String(row.status || "").toLowerCase();
    const severity = String(row.severity || "").toLowerCase();
    return severity === "critical" && !readyStatuses.has(status);
  });
  const score = weightedScore(allRows);
  const recommendation = blockers.length === 0 && criticalOpen.length === 0 && score >= 92 ? "safe to upload" : "finish go-live checks";

  return { checks, routes, handoff, env, blockers, criticalOpen, score, recommendation };
}
