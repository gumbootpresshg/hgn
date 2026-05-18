import { supabase } from "@/lib/supabase";

export type TrainingRow = Record<string, any>;

export function trainingTone(status?: string | null, priority?: string | null) {
  const s = String(status || "").toLowerCase();
  const p = String(priority || "").toLowerCase();
  if (["blocked", "missing", "overdue", "urgent"].includes(s) || p === "urgent") return "bad";
  if (["ready", "complete", "done", "published", "trained", "active"].includes(s)) return "good";
  if (["draft", "todo", "review", "in-progress", "invited"].includes(s) || p === "high") return "warn";
  return "neutral";
}

export function trainingToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

async function readTable(table: string, order = "created_at", ascending = false) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(100);
  if (error) return [] as TrainingRow[];
  return (data || []) as TrainingRow[];
}

function isDone(status: unknown) {
  return ["ready", "complete", "done", "published", "trained", "active"].includes(String(status || "").toLowerCase());
}

export async function getTrainingDeskSnapshot() {
  const [modules, onboarding, resources, tasks] = await Promise.all([
    readTable("training_modules", "updated_at", false),
    readTable("staff_onboarding_runs", "created_at", false),
    readTable("training_resources", "updated_at", false),
    readTable("beta_training_tasks", "created_at", false),
  ]);

  const readyModules = modules.filter((item) => isDone(item.status));
  const draftModules = modules.filter((item) => !isDone(item.status));
  const activeOnboarding = onboarding.filter((item) => !isDone(item.status));
  const completeOnboarding = onboarding.filter((item) => isDone(item.status));
  const readyResources = resources.filter((item) => isDone(item.status));
  const draftResources = resources.filter((item) => !isDone(item.status));
  const openTasks = tasks.filter((item) => !isDone(item.status));
  const urgentTasks = tasks.filter((item) => ["urgent", "high"].includes(String(item.priority || "").toLowerCase()) && !isDone(item.status));

  const moduleScore = modules.length ? Math.round((readyModules.length / modules.length) * 35) : 8;
  const resourceScore = resources.length ? Math.round((readyResources.length / resources.length) * 20) : 5;
  const onboardingScore = onboarding.length ? Math.round((completeOnboarding.length / onboarding.length) * 20) : 8;
  const taskPenalty = Math.min(30, openTasks.length * 4 + urgentTasks.length * 5);
  const score = Math.max(0, Math.min(100, moduleScore + resourceScore + onboardingScore + 25 - taskPenalty));

  return { score, modules, onboarding, resources, tasks, readyModules, draftModules, activeOnboarding, completeOnboarding, readyResources, draftResources, openTasks, urgentTasks };
}
