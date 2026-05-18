import { supabase } from "@/lib/supabase";

export type AccessibilityRow = Record<string, any>;

export function accessibilityTone(status?: string | null, priority?: string | null) {
  const s = String(status || "").toLowerCase();
  const p = String(priority || "").toLowerCase();
  if (["blocked", "failed", "open", "new", "needs-review", "risk"].includes(s) || p === "urgent") return "bad";
  if (["passed", "pass", "ready", "done", "resolved", "green", "complete"].includes(s)) return "good";
  if (["review", "in progress", "todo", "testing"].includes(s) || p === "high") return "warn";
  return "neutral";
}

export function accessibilityToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

async function readTable(table: string, order = "created_at", ascending = false) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(100);
  if (error) return [] as AccessibilityRow[];
  return (data || []) as AccessibilityRow[];
}

function isClosed(status: unknown) {
  return ["passed", "pass", "ready", "done", "resolved", "green", "complete", "closed"].includes(String(status || "").toLowerCase());
}

export async function getAccessibilitySnapshot() {
  const [checks, tasks, requests] = await Promise.all([
    readTable("accessibility_audit_checks", "created_at", false),
    readTable("accessibility_remediation_tasks", "created_at", false),
    readTable("accessibility_reader_requests", "created_at", false),
  ]);

  const passedChecks = checks.filter((item) => isClosed(item.status));
  const openChecks = checks.filter((item) => !isClosed(item.status));
  const openTasks = tasks.filter((item) => !isClosed(item.status));
  const urgentTasks = openTasks.filter((item) => ["urgent", "high"].includes(String(item.priority || "").toLowerCase()));
  const openRequests = requests.filter((item) => !isClosed(item.status));
  const routeCoverage = new Set(checks.map((item) => item.route_path).filter(Boolean)).size;

  const checkScore = checks.length ? Math.round((passedChecks.length / checks.length) * 45) : 0;
  const coverageScore = Math.min(20, routeCoverage * 4);
  const requestScore = openRequests.length ? Math.max(0, 15 - openRequests.length * 3) : 15;
  const taskPenalty = Math.min(45, openTasks.length * 8 + urgentTasks.length * 6);
  const score = Math.max(0, Math.min(100, checkScore + coverageScore + requestScore + (checks.length >= 5 ? 20 : 8) - taskPenalty));

  return { score, checks, tasks, requests, passedChecks, openChecks, openTasks, urgentTasks, openRequests, routeCoverage };
}
