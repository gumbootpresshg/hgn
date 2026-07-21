import { getBetaOpsSnapshot, safeRows } from "@/lib/beta-ops";
import { getPreflightSnapshot } from "@/lib/preflight";

export type LaunchRow = Record<string, any>;

export function launchTone(status?: string | null) {
  const s = String(status || "").toLowerCase();
  if (["go", "approved", "complete", "done", "green", "sent", "published", "resolved"].includes(s)) return "good";
  if (["watch", "review", "draft", "scheduled", "yellow", "pending", "in_progress"].includes(s)) return "warn";
  if (["no_go", "blocked", "red", "failed", "open", "critical"].includes(s)) return "bad";
  return "neutral";
}

export function launchToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-white text-slate-900";
}

export function launchDecisionLabel(score: number, blockers: number) {
  if (blockers > 0) return "No-go: blockers open";
  if (score >= 85) return "Go: beta-ready";
  if (score >= 70) return "Watch: close to beta";
  return "No-go: more hardening needed";
}

export async function getLaunchRoomSnapshot() {
  const [ops, preflight, decisions, tasks, comms] = await Promise.all([
    getBetaOpsSnapshot(),
    getPreflightSnapshot(),
    safeRows("beta_launch_decisions", "created_at", 8),
    safeRows("beta_release_tasks", "sort_order", 40, true),
    safeRows("beta_comms_queue", "send_at", 12),
  ]);

  const openTasks = tasks.filter((task) => !["done", "complete", "sent", "published"].includes(String(task.status || "").toLowerCase())).length;
  const redTasks = tasks.filter((task) => ["blocked", "red", "failed"].includes(String(task.status || "").toLowerCase())).length;
  const commsReady = comms.filter((item) => ["approved", "scheduled", "sent"].includes(String(item.status || "").toLowerCase())).length;
  const operationalScore = Math.round((ops.readiness + preflight.averageScore) / 2) - redTasks * 8 - Math.min(openTasks, 8) * 2;
  const score = Math.max(0, Math.min(100, operationalScore));
  const blockers = ops.blockers + ops.openIncidents + preflight.blocked + redTasks;

  return {
    ops,
    preflight,
    decisions,
    tasks,
    comms,
    openTasks,
    redTasks,
    commsReady,
    score,
    blockers,
    decisionLabel: launchDecisionLabel(score, blockers),
  };
}
