import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function editQueueToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  if (tone === "blue") return "border-blue-200 bg-blue-50 text-blue-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function toneForEditQueueItem(item: Row) {
  const stage = String(item.queue_stage || "").toLowerCase();
  const priority = String(item.priority || "").toLowerCase();
  if (stage === "blocked" || priority === "urgent") return "bad";
  if (stage === "needs_edit" || stage === "needs_media" || priority === "high") return "warn";
  if (stage === "ready" || stage === "published" || stage === "done") return "good";
  if (stage === "needs_review") return "blue";
  return "neutral";
}

export function itemCompletionScore(item: Row) {
  const checks = [item.headline_done, item.body_done, item.image_done, item.seo_done, item.homepage_done];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export async function getEditQueueSnapshot() {
  const [items, notes, publishItems, mediaItems] = await Promise.all([
    safeSelect("edit_queue_items", "sort_order", true, 100),
    safeSelect("edit_queue_notes", "updated_at", false, 20),
    safeSelect("publish_sweep_items", "sort_order", true, 50),
    safeSelect("media_flow_tasks", "sort_order", true, 50),
  ]);

  const active = items.filter((item) => !["done", "published", "dropped"].includes(String(item.queue_stage || "").toLowerCase()));
  const blocked = items.filter((item) => String(item.queue_stage || "").toLowerCase() === "blocked" || String(item.priority || "").toLowerCase() === "urgent");
  const ready = items.filter((item) => ["ready", "published", "done"].includes(String(item.queue_stage || "").toLowerCase()));
  const needsMedia = items.filter((item) => !item.image_done || String(item.queue_stage || "") === "needs_media");
  const averageItemScore = items.length ? Math.round(items.reduce((sum, item) => sum + itemCompletionScore(item), 0) / items.length) : 70;

  let score = averageItemScore;
  if (active.length <= 6) score += 8;
  if (ready.length > 0) score += 8;
  if (blocked.length > 0) score -= 25;
  if (needsMedia.length > 3) score -= 10;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    items,
    notes,
    active,
    blocked,
    ready,
    needsMedia,
    publishItems,
    mediaItems,
  };
}
