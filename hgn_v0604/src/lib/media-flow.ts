import { supabase } from "@/lib/supabase";

export type MediaFlowRow = Record<string, any>;

async function safeSelect(table: string, order = "created_at", ascending = false, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as MediaFlowRow[];
  return (data || []) as MediaFlowRow[];
}

export function mediaFlowTone(status?: string, priority?: string) {
  const value = `${status || ""} ${priority || ""}`.toLowerCase();
  if (value.includes("blocked") || value.includes("urgent")) return "bad";
  if (value.includes("needs") || value.includes("todo") || value.includes("review") || value.includes("high")) return "warn";
  if (value.includes("ready") || value.includes("done") || value.includes("complete") || value.includes("approved")) return "good";
  return "neutral";
}

export function mediaFlowToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getMediaFlowSnapshot() {
  const [items, tasks, guidelines] = await Promise.all([
    safeSelect("media_flow_items", "updated_at", false, 100),
    safeSelect("media_flow_tasks", "updated_at", false, 100),
    safeSelect("media_flow_guidelines", "sort_order", true, 50),
  ]);

  const openItems = items.filter((item) => !["done", "complete", "approved", "closed"].includes(String(item.status || "").toLowerCase()));
  const missingBasics = openItems.filter((item) => item.needs_credit || item.needs_caption || item.needs_alt_text || item.needs_crop_check || !item.credit || !item.alt_text);
  const openTasks = tasks.filter((task) => !["done", "complete", "closed"].includes(String(task.status || "").toLowerCase()));
  const blocked = [...items, ...tasks].filter((row) => mediaFlowTone(row.status, row.priority) === "bad");
  const activeGuidelines = guidelines.filter((row) => row.is_active !== false);

  let score = 60;
  if (missingBasics.length === 0) score += 15;
  if (openTasks.length <= 4) score += 10;
  if (blocked.length === 0) score += 10;
  if (activeGuidelines.length >= 3) score += 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, items, openItems, missingBasics, tasks, openTasks, blocked, guidelines, activeGuidelines };
}
