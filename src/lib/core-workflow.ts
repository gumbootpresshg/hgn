import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function coreWorkflowTone(status: string) {
  const value = String(status || "").toLowerCase();
  if (["active", "ready", "primary"].includes(value)) return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (["next", "today", "watch"].includes(value)) return "border-blue-200 bg-blue-50 text-blue-950";
  if (["blocked", "stuck"].includes(value)) return "border-rose-200 bg-rose-50 text-rose-950";
  if (["parked", "later"].includes(value)) return "border-slate-200 bg-slate-50 text-slate-700";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getCoreWorkflowSnapshot() {
  const [steps, routes, notes] = await Promise.all([
    safeSelect("core_workflow_steps", "sort_order", true, 50),
    safeSelect("core_workflow_routes", "sort_order", true, 50),
    safeSelect("core_workflow_notes", "created_at", false, 20),
  ]);

  const activeSteps = steps.filter((step) => String(step.step_status || "").toLowerCase() === "active");
  const blockedSteps = steps.filter((step) => String(step.step_status || "").toLowerCase() === "blocked");
  const parkedRoutes = routes.filter((route) => String(route.route_status || "").toLowerCase() === "parked");
  const primaryRoutes = routes.filter((route) => String(route.route_status || "").toLowerCase() === "primary");

  let score = 88;
  score -= Math.max(0, activeSteps.length - 6) * 4;
  score -= blockedSteps.length * 12;
  score -= Math.max(0, primaryRoutes.length - 4) * 6;
  score += parkedRoutes.length ? 4 : 0;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { steps, routes, notes, activeSteps, blockedSteps, parkedRoutes, primaryRoutes, score };
}
