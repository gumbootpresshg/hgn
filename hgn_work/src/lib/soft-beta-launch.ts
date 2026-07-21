import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function betaLaunchTone(status: string) {
  const value = String(status || "").toLowerCase();
  if (["done", "passed", "ready", "green"].includes(value)) return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (["working", "review", "watch", "yellow"].includes(value)) return "border-amber-200 bg-amber-50 text-amber-950";
  if (["blocked", "failed", "red"].includes(value)) return "border-red-200 bg-red-50 text-red-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function betaLaunchScore(items: Row[], tasks: Row[], checks: Row[]) {
  const rows = [...items, ...tasks, ...checks];
  if (!rows.length) return 72;

  const total = rows.reduce((sum, row) => {
    const status = String(row.status || row.check_status || row.task_status || "").toLowerCase();
    if (["done", "passed", "ready", "green"].includes(status)) return sum + 1;
    if (["working", "review", "watch", "yellow"].includes(status)) return sum + 0.55;
    if (["blocked", "failed", "red"].includes(status)) return sum - 0.2;
    return sum + 0.25;
  }, 0);

  return Math.max(0, Math.min(100, Math.round((total / rows.length) * 100)));
}

export async function getSoftBetaLaunchSnapshot() {
  const [readiness, tasks, publicChecks, routeAudit, notes] = await Promise.all([
    safeSelect("soft_beta_readiness_items", "sort_order", true, 80),
    safeSelect("soft_beta_go_live_tasks", "sort_order", true, 80),
    safeSelect("soft_beta_public_checks", "sort_order", true, 80),
    safeSelect("soft_beta_route_audit", "route_path", true, 120),
    safeSelect("soft_beta_deployment_notes", "created_at", false, 30),
  ]);

  const blockers = [...readiness, ...tasks, ...publicChecks].filter((row) => {
    const status = String(row.status || row.task_status || row.check_status || "").toLowerCase();
    return ["blocked", "failed", "red"].includes(status);
  });

  const watch = [...readiness, ...tasks, ...publicChecks].filter((row) => {
    const status = String(row.status || row.task_status || row.check_status || "").toLowerCase();
    return ["working", "review", "watch", "yellow"].includes(status);
  });

  const score = betaLaunchScore(readiness, tasks, publicChecks);

  return { readiness, tasks, publicChecks, routeAudit, notes, blockers, watch, score };
}
