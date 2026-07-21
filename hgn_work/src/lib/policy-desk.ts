import { supabase } from "@/lib/supabase";

export type PolicyRow = Record<string, any>;

export function policyTone(status?: string | null, priority?: string | null) {
  const s = String(status || "").toLowerCase();
  const p = String(priority || "").toLowerCase();
  if (["blocked", "expired", "missing", "risk", "overdue"].includes(s) || p === "urgent") return "bad";
  if (["approved", "published", "complete", "done", "ready", "resolved"].includes(s)) return "good";
  if (["draft", "review", "needs-review", "in-progress", "queued"].includes(s) || p === "high") return "warn";
  return "neutral";
}

export function policyToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

async function readTable(table: string, order = "created_at", ascending = false) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(100);
  if (error) return [] as PolicyRow[];
  return (data || []) as PolicyRow[];
}

function isDone(status: unknown) {
  return ["approved", "published", "complete", "done", "ready", "resolved"].includes(String(status || "").toLowerCase());
}

export async function getPolicyDeskSnapshot() {
  const [documents, tasks, checks, risks] = await Promise.all([
    readTable("site_policy_documents", "updated_at", false),
    readTable("policy_review_tasks", "created_at", false),
    readTable("consent_compliance_checks", "created_at", false),
    readTable("legal_risk_register", "created_at", false),
  ]);

  const publishedDocs = documents.filter((item) => ["published", "approved"].includes(String(item.status || "").toLowerCase()));
  const openTasks = tasks.filter((item) => !isDone(item.status));
  const failedChecks = checks.filter((item) => ["missing", "failed", "needs-review", "blocked"].includes(String(item.status || "").toLowerCase()));
  const openRisks = risks.filter((item) => !isDone(item.status));
  const urgentRisks = risks.filter((item) => ["urgent", "high"].includes(String(item.priority || item.severity || "").toLowerCase()) && !isDone(item.status));

  const docScore = Math.min(35, publishedDocs.length * 9);
  const checkScore = checks.length ? Math.round(((checks.length - failedChecks.length) / checks.length) * 30) : 0;
  const taskPenalty = Math.min(25, openTasks.length * 4);
  const riskPenalty = Math.min(35, openRisks.length * 6 + urgentRisks.length * 5);
  const score = Math.max(0, Math.min(100, docScore + checkScore + 30 - taskPenalty - riskPenalty));

  return { score, documents, tasks, checks, risks, publishedDocs, openTasks, failedChecks, openRisks, urgentRisks };
}
