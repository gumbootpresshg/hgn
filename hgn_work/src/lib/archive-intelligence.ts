import { supabase } from "@/lib/supabase";

export type ArchiveRow = Record<string, any>;

export function archiveTone(status?: string | null, priority?: string | null) {
  const s = String(status || "").toLowerCase();
  const p = String(priority || "").toLowerCase();
  if (["blocked", "failed", "needs-review", "missing", "stale"].includes(s) || p === "urgent") return "bad";
  if (["active", "ready", "done", "complete", "resolved", "published", "verified"].includes(s)) return "good";
  if (["queued", "draft", "review", "in progress", "testing"].includes(s) || p === "high") return "warn";
  return "neutral";
}

export function archiveToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

async function readTable(table: string, order = "created_at", ascending = false) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(100);
  if (error) return [] as ArchiveRow[];
  return (data || []) as ArchiveRow[];
}

function isClosed(status: unknown) {
  return ["active", "ready", "done", "complete", "resolved", "published", "verified"].includes(String(status || "").toLowerCase());
}

function isOpen(status: unknown) {
  return !["done", "complete", "resolved", "published", "verified", "archived"].includes(String(status || "").toLowerCase());
}

export async function getArchiveIntelligenceSnapshot() {
  const [topics, tags, queue, qa] = await Promise.all([
    readTable("archive_topic_index", "updated_at", false),
    readTable("archive_article_tags", "created_at", false),
    readTable("evergreen_resurfacing_queue", "created_at", false),
    readTable("archive_search_qa_checks", "created_at", false),
  ]);

  const activeTopics = topics.filter((item) => String(item.status || "").toLowerCase() === "active");
  const verifiedTags = tags.filter((item) => ["verified", "approved", "complete"].includes(String(item.verification_status || "").toLowerCase()));
  const openQueue = queue.filter((item) => isOpen(item.status));
  const openQa = qa.filter((item) => !isClosed(item.status));
  const highPriority = [...openQueue, ...openQa, ...topics].filter((item) => ["urgent", "high"].includes(String(item.priority || "").toLowerCase()));

  const topicScore = Math.min(30, activeTopics.length * 7);
  const tagScore = tags.length ? Math.round((verifiedTags.length / tags.length) * 25) : 0;
  const queueScore = Math.min(20, queue.length * 4) - Math.min(15, openQueue.length * 2);
  const qaPenalty = Math.min(35, openQa.length * 7 + highPriority.length * 3);
  const score = Math.max(0, Math.min(100, topicScore + tagScore + queueScore + 25 - qaPenalty));

  return { score, topics, tags, queue, qa, activeTopics, verifiedTags, openQueue, openQa, highPriority };
}
