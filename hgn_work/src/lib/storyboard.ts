import { supabase } from "@/lib/supabase";

export type StoryboardRow = Record<string, any>;

async function safeSelect(table: string, order = "updated_at", ascending = false, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as StoryboardRow[];
  return (data || []) as StoryboardRow[];
}

export function storyboardTone(state?: string, priority?: string, needsPhoto?: boolean, needsSourceCheck?: boolean) {
  const value = String(state || "").toLowerCase();
  const level = String(priority || "").toLowerCase();
  if (value === "blocked" || needsPhoto || needsSourceCheck) return "bad";
  if (value === "waiting" || value === "drafting" || level === "high") return "warn";
  if (value === "ready" || value === "published") return "good";
  return "neutral";
}

export function storyboardToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getStoryboardSnapshot() {
  const [items, notes] = await Promise.all([
    safeSelect("newsroom_storyboard_items", "sort_order", true, 100),
    safeSelect("newsroom_storyboard_notes", "updated_at", false, 50),
  ]);

  const activeItems = items.filter((item) => !["published", "dropped", "archived"].includes(String(item.workflow_state || "").toLowerCase()));
  const readyItems = items.filter((item) => String(item.workflow_state || "").toLowerCase() === "ready");
  const waitingItems = items.filter((item) => ["waiting", "blocked"].includes(String(item.workflow_state || "").toLowerCase()) || item.needs_photo || item.needs_source_check);
  const highPriority = items.filter((item) => String(item.priority_level || "").toLowerCase() === "high" && !["published", "dropped"].includes(String(item.workflow_state || "").toLowerCase()));

  let score = 70;
  if (readyItems.length > 0) score += 10;
  if (activeItems.length <= 8) score += 10;
  if (waitingItems.length === 0) score += 10;
  if (waitingItems.length > 3) score -= 15;
  if (activeItems.length > 12) score -= 10;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, items, notes, activeItems, readyItems, waitingItems, highPriority };
}
