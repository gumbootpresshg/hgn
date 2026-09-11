import { supabase } from "@/lib/supabase";

export type NewsletterRow = Record<string, any>;

export function newsletterTone(status?: string | null) {
  const s = String(status || "").toLowerCase();
  if (["sent", "published", "active", "done", "complete", "ready"].includes(s)) return "good";
  if (["blocked", "failed", "stale", "needs_fix"].includes(s)) return "bad";
  if (["draft", "scheduled", "todo", "review", "pending"].includes(s)) return "warn";
  return "neutral";
}

export function newsletterToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

async function readTable(table: string, order = "created_at") {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending: false }).limit(100);
  if (error) return [] as NewsletterRow[];
  return (data || []) as NewsletterRow[];
}

export async function getNewsletterDispatchSnapshot() {
  const [editions, segments, tasks, metrics] = await Promise.all([
    readTable("newsletter_editions", "created_at"),
    readTable("newsletter_segments", "created_at"),
    readTable("newsletter_dispatch_tasks", "checklist_order"),
    readTable("newsletter_metrics_snapshots", "metric_date"),
  ]);

  const activeSegments = segments.filter((item) => ["active", "ready"].includes(String(item.status || "").toLowerCase())).length;
  const draftEditions = editions.filter((item) => ["draft", "review", "scheduled"].includes(String(item.status || "").toLowerCase())).length;
  const sentEditions = editions.filter((item) => ["sent", "published"].includes(String(item.status || "").toLowerCase())).length;
  const openTasks = tasks.filter((item) => !["done", "complete"].includes(String(item.status || "").toLowerCase())).length;
  const completeTasks = tasks.length - openTasks;
  const latestMetric = metrics[0] || {};

  const score = Math.max(0, Math.min(100,
    Math.min(25, activeSegments * 8) +
    Math.min(25, completeTasks * 8) +
    Math.min(25, editions.filter((item) => item.subject_line && item.top_story_title).length * 8) +
    Math.min(15, sentEditions * 10) +
    Math.min(10, metrics.length * 5) -
    Math.min(25, openTasks * 4)
  ));

  return { score, editions, segments, tasks, metrics, activeSegments, draftEditions, sentEditions, openTasks, latestMetric };
}

export async function getPublicNewsletterEditions() {
  const { data, error } = await supabase
    .from("newsletter_editions")
    .select("*")
    .in("status", ["published", "sent"])
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(25);
  if (error) return [] as NewsletterRow[];
  return (data || []) as NewsletterRow[];
}
