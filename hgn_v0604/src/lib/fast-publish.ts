import { supabase } from "@/lib/supabase";

export type FastPublishRow = Record<string, any>;

async function safeSelect(table: string, order = "created_at", ascending = false, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as FastPublishRow[];
  return (data || []) as FastPublishRow[];
}

export function fastPublishTone(status?: string, priority?: string) {
  const value = `${status || ""} ${priority || ""}`.toLowerCase();
  if (value.includes("blocked") || value.includes("urgent") || value.includes("stuck")) return "bad";
  if (value.includes("todo") || value.includes("draft") || value.includes("needs") || value.includes("high")) return "warn";
  if (value.includes("ready") || value.includes("published") || value.includes("done") || value.includes("complete")) return "good";
  return "neutral";
}

export function fastPublishToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getFastPublishSnapshot() {
  const [presets, queue, actions, notes] = await Promise.all([
    safeSelect("fast_publish_presets", "sort_order", true, 50),
    safeSelect("fast_publish_queue", "updated_at", false, 80),
    safeSelect("fast_publish_actions", "updated_at", false, 100),
    safeSelect("fast_publish_notes", "updated_at", false, 40),
  ]);

  const activePresets = presets.filter((preset) => preset.is_active !== false);
  const openQueue = queue.filter((item) => !["published", "done", "closed"].includes(String(item.queue_status || "").toLowerCase()));
  const readyQueue = queue.filter((item) => ["ready", "ready_now", "approved"].includes(String(item.queue_status || "").toLowerCase()));
  const blockedQueue = queue.filter((item) => String(item.queue_status || "").toLowerCase().includes("blocked") || ["high", "urgent"].includes(String(item.priority || "").toLowerCase()));
  const openActions = actions.filter((action) => !["done", "complete", "closed"].includes(String(action.status || "").toLowerCase()));
  const missingBasics = openQueue.filter((item) => item.needs_image || item.needs_seo || item.needs_copy_check || item.needs_homepage_slot);

  let score = 55;
  if (activePresets.length >= 3) score += 10;
  if (readyQueue.length >= 1) score += 10;
  if (blockedQueue.length === 0) score += 10;
  if (missingBasics.length <= 2) score += 10;
  if (openActions.length <= 6) score += 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, presets, activePresets, queue, openQueue, readyQueue, blockedQueue, actions, openActions, missingBasics, notes };
}
