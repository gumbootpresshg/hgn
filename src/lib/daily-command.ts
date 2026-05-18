import { supabase } from "@/lib/supabase";

export type DailyCommandRow = Record<string, any>;

async function safeSelect(table: string, order = "created_at", limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending: false }).limit(limit);
  if (error) return [] as DailyCommandRow[];
  return (data || []) as DailyCommandRow[];
}

export function dailyTone(status?: string, priority?: string) {
  const value = `${status || ""} ${priority || ""}`.toLowerCase();
  if (value.includes("blocked") || value.includes("urgent") || value.includes("stuck")) return "bad";
  if (value.includes("todo") || value.includes("doing") || value.includes("high") || value.includes("needs")) return "warn";
  if (value.includes("done") || value.includes("ready") || value.includes("published") || value.includes("sent") || value.includes("complete")) return "good";
  return "neutral";
}

export function dailyToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getDailyCommandSnapshot() {
  const [runs, tasks, handoffs, slots] = await Promise.all([
    safeSelect("daily_operator_runs", "run_date", 30),
    safeSelect("daily_operator_tasks", "updated_at", 120),
    safeSelect("daily_operator_handoffs", "updated_at", 80),
    safeSelect("daily_focus_slots", "slot_order", 80),
  ]);

  const activeRun = runs.find((run) => !["closed", "done", "archived"].includes(String(run.status || "").toLowerCase())) || runs[0];
  const runId = activeRun?.id;
  const runTasks = runId ? tasks.filter((task) => task.run_id === runId || !task.run_id) : tasks;
  const runHandoffs = runId ? handoffs.filter((item) => item.run_id === runId || !item.run_id) : handoffs;
  const runSlots = runId ? slots.filter((slot) => slot.run_id === runId || !slot.run_id) : slots;

  const openTasks = runTasks.filter((task) => !["done", "published", "archived"].includes(String(task.status || "").toLowerCase()));
  const blockedTasks = runTasks.filter((task) => dailyTone(task.status, task.priority) === "bad");
  const doneTasks = runTasks.filter((task) => ["done", "published", "complete"].includes(String(task.status || "").toLowerCase()));
  const openHandoffs = runHandoffs.filter((item) => !["done", "closed", "archived"].includes(String(item.status || "").toLowerCase()));
  const filledSlots = runSlots.filter((slot) => slot.story_title || slot.article_slug || ["filled", "ready", "done"].includes(String(slot.status || "").toLowerCase()));

  let score = Number(activeRun?.readiness_score ?? 45);
  if (doneTasks.length >= 2) score += 10;
  if (blockedTasks.length === 0) score += 15;
  if (filledSlots.length >= 2) score += 10;
  if (openHandoffs.length <= 2) score += 5;
  if (openTasks.length <= 6) score += 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, runs, tasks: runTasks, handoffs: runHandoffs, slots: runSlots, activeRun, openTasks, blockedTasks, doneTasks, openHandoffs, filledSlots };
}
