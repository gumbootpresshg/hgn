import { supabase } from "@/lib/supabase";

export type LiveDeskRow = Record<string, any>;

async function safeSelect(table: string, order = "updated_at", ascending = false, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as LiveDeskRow[];
  return (data || []) as LiveDeskRow[];
}

export function liveDeskTone(status?: string, priority?: string, pinned?: boolean) {
  const value = `${status || ""} ${priority || ""}`.toLowerCase();
  if (value.includes("urgent") || value.includes("breaking") || value.includes("blocked")) return "bad";
  if (pinned || value.includes("live") || value.includes("watching") || value.includes("high")) return "warn";
  if (value.includes("published") || value.includes("closed") || value.includes("done")) return "good";
  return "neutral";
}

export function liveDeskToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getLiveDeskSnapshot() {
  const [stories, updates, tasks] = await Promise.all([
    safeSelect("live_desk_stories", "updated_at", false, 100),
    safeSelect("live_desk_updates", "created_at", false, 100),
    safeSelect("live_desk_tasks", "updated_at", false, 100),
  ]);

  const openStories = stories.filter((story) => !["closed", "resolved"].includes(String(story.status || "").toLowerCase()));
  const pinnedStories = stories.filter((story) => story.pinned);
  const draftUpdates = updates.filter((update) => !["published", "closed"].includes(String(update.status || "").toLowerCase()));
  const openTasks = tasks.filter((task) => !["done", "closed"].includes(String(task.status || "").toLowerCase()));
  const urgent = [...stories, ...tasks].filter((row) => liveDeskTone(row.status, row.priority, row.pinned) === "bad");

  let score = 70;
  if (urgent.length === 0) score += 10;
  if (draftUpdates.length <= 3) score += 10;
  if (openTasks.length <= 4) score += 10;
  if (pinnedStories.length > 3) score -= 10;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, stories, openStories, pinnedStories, updates, draftUpdates, tasks, openTasks, urgent };
}
