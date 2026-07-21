import { supabase } from "@/lib/supabase";

export type ModRow = Record<string, any>;

async function safeSelect(table: string, order = "created_at") {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending: false }).limit(80);
  if (error) return [] as ModRow[];
  return (data || []) as ModRow[];
}

export function moderationTone(status?: string, priority?: string, risk?: string) {
  const value = `${status || ""} ${priority || ""} ${risk || ""}`.toLowerCase();
  if (value.includes("critical") || value.includes("urgent") || value.includes("high") || value.includes("escalated")) return "bad";
  if (value.includes("review") || value.includes("pending") || value.includes("medium") || value.includes("todo")) return "warn";
  if (value.includes("approved") || value.includes("resolved") || value.includes("active") || value.includes("done")) return "good";
  return "neutral";
}

export function moderationToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-900";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getModerationDeskSnapshot() {
  const [cases, rules, checks, tasks] = await Promise.all([
    safeSelect("moderation_cases"),
    safeSelect("moderation_rules"),
    safeSelect("moderation_checks"),
    safeSelect("moderation_tasks"),
  ]);

  const openCases = cases.filter((item) => !["approved", "rejected", "resolved", "archived"].includes(String(item.status || "").toLowerCase()));
  const highRiskCases = cases.filter((item) => ["high", "critical"].includes(String(item.risk_level || "").toLowerCase()) || ["high", "urgent"].includes(String(item.priority || "").toLowerCase()));
  const activeRules = rules.filter((item) => ["active", "ready", "published"].includes(String(item.status || "").toLowerCase()));
  const pendingChecks = checks.filter((item) => !["passed", "complete", "done"].includes(String(item.status || "").toLowerCase()));
  const openTasks = tasks.filter((item) => !["done", "complete", "resolved"].includes(String(item.status || "").toLowerCase()));
  const urgentTasks = tasks.filter((item) => ["high", "urgent"].includes(String(item.priority || "").toLowerCase()) && !["done", "complete", "resolved"].includes(String(item.status || "").toLowerCase()));

  let score = 35;
  if (activeRules.length >= 3) score += 20;
  if (openCases.length <= 5) score += 15;
  if (highRiskCases.length === 0) score += 15;
  if (urgentTasks.length === 0) score += 10;
  if (pendingChecks.length <= 3) score += 5;
  score = Math.max(0, Math.min(100, score));

  return { score, cases, rules, checks, tasks, openCases, highRiskCases, activeRules, pendingChecks, openTasks, urgentTasks };
}
