import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

const readyStatuses = new Set(["done", "ready", "passed", "clean", "complete", "enabled"]);
const riskStatuses = new Set(["blocked", "failed", "missing", "open", "risk", "disabled"]);

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

async function safeRecent(table: string, order = "created_at", limit = 10) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending: false }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function securityAlertTone(status: string, priority = "medium") {
  const value = String(status || "").toLowerCase();
  const level = String(priority || "medium").toLowerCase();
  if (readyStatuses.has(value)) return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (riskStatuses.has(value) || level === "critical") return "border-red-200 bg-red-50 text-red-950";
  if (level === "high") return "border-orange-200 bg-orange-50 text-orange-950";
  return "border-slate-200 bg-white text-slate-950";
}

function scoreChecks(rows: Row[]) {
  if (!rows.length) return 72;
  let earned = 0;
  let possible = 0;
  for (const row of rows) {
    const status = String(row.status || "").toLowerCase();
    const priority = String(row.priority || "medium").toLowerCase();
    const weight = priority === "critical" ? 2.5 : priority === "high" ? 1.6 : 1;
    possible += weight;
    if (readyStatuses.has(status)) earned += weight;
    else if (riskStatuses.has(status)) earned += 0;
    else earned += weight * 0.5;
  }
  return Math.max(0, Math.min(100, Math.round((earned / possible) * 100)));
}

export async function getSecurityAlertsSnapshot() {
  const [checks, settings, logs, recentLetters] = await Promise.all([
    safeSelect("security_hardening_checks", "sort_order", true, 100),
    safeSelect("submission_alert_settings", "alert_label", true, 20),
    safeRecent("submission_alert_log", "created_at", 8),
    safeRecent("letters_to_editor", "created_at", 8),
  ]);

  const blockers = checks.filter((row) => {
    const status = String(row.status || "").toLowerCase();
    const priority = String(row.priority || "").toLowerCase();
    return riskStatuses.has(status) && (priority === "critical" || priority === "high");
  });

  const enabledAlerts = settings.filter((row) => row.is_enabled);
  const score = scoreChecks(checks);
  const recommendation = blockers.length === 0 && enabledAlerts.length > 0
    ? "security and submission alerts are ready for soft beta"
    : "finish critical security checks and configure at least one alert destination before opening submissions";

  return { checks, settings, logs, recentLetters, blockers, enabledAlerts, score, recommendation };
}
