import { supabase } from "@/lib/supabase";

export type NewsroomRow = Record<string, any>;

async function safeSelect(table: string, order = "created_at", limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending: false }).limit(limit);
  if (error) return [] as NewsroomRow[];
  return (data || []) as NewsroomRow[];
}

export function newsroomTone(status?: string, priority?: string) {
  const value = `${status || ""} ${priority || ""}`.toLowerCase();
  if (value.includes("blocked") || value.includes("urgent") || value.includes("stuck")) return "bad";
  if (value.includes("needs") || value.includes("todo") || value.includes("doing") || value.includes("high")) return "warn";
  if (value.includes("ready") || value.includes("done") || value.includes("published") || value.includes("complete") || value.includes("filled")) return "good";
  return "neutral";
}

export function newsroomToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getNewsroomStreamlineSnapshot() {
  const [queue, notes, homepage, dailyTasks, dailyRuns] = await Promise.all([
    safeSelect("newsroom_queue_items", "updated_at", 120),
    safeSelect("newsroom_notes", "updated_at", 80),
    safeSelect("newsroom_homepage_controls", "slot_order", 50),
    safeSelect("daily_operator_tasks", "updated_at", 120),
    safeSelect("daily_operator_runs", "run_date", 20),
  ]);

  const openQueue = queue.filter((item) => !["done", "published", "archived"].includes(String(item.status || "").toLowerCase()));
  const needsAttention = queue.filter((item) => newsroomTone(item.status, item.priority) !== "good");
  const publishToday = queue.filter((item) => item.publish_today && !["done", "published"].includes(String(item.status || "").toLowerCase()));
  const homepageReady = homepage.filter((slot) => slot.story_title || slot.article_slug || ["filled", "ready", "done"].includes(String(slot.status || "").toLowerCase()));
  const pinnedNotes = notes.filter((note) => note.pinned && !["closed", "archived"].includes(String(note.status || "").toLowerCase()));
  const activeRun = dailyRuns.find((run) => !["closed", "done", "archived"].includes(String(run.status || "").toLowerCase())) || dailyRuns[0];

  let score = 50;
  if (publishToday.length <= 4) score += 10;
  if (needsAttention.length <= 5) score += 15;
  if (homepageReady.length >= 2) score += 15;
  if (pinnedNotes.length <= 4) score += 5;
  if (openQueue.length <= 8) score += 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, queue, notes, homepage, dailyTasks, dailyRuns, activeRun, openQueue, needsAttention, publishToday, homepageReady, pinnedNotes };
}
