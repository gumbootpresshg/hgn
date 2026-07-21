import { supabase } from "@/lib/supabase";

export type DistributionRow = Record<string, any>;

export function distributionTone(status?: string | null) {
  const s = String(status || "").toLowerCase();
  if (["done", "complete", "completed", "sent", "published", "active", "ready"].includes(s)) return "good";
  if (["blocked", "failed", "risk", "overdue", "paused"].includes(s)) return "bad";
  if (["planned", "todo", "draft", "queued", "in progress", "review"].includes(s)) return "warn";
  return "neutral";
}

export function distributionToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

async function readTable(table: string, order = "created_at", ascending = false) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(100);
  if (error) return [] as DistributionRow[];
  return (data || []) as DistributionRow[];
}

export async function getDistributionSnapshot() {
  const [channels, runs, tasks] = await Promise.all([
    readTable("distribution_channels", "sort_order", true),
    readTable("distribution_runs", "publish_date", false),
    readTable("distribution_tasks", "due_at", true),
  ]);

  const activeChannels = channels.filter((item) => ["active", "ready"].includes(String(item.status || "").toLowerCase()));
  const primaryChannels = channels.filter((item) => item.is_primary);
  const openRuns = runs.filter((item) => !["done", "complete", "completed", "published", "cancelled"].includes(String(item.status || "").toLowerCase()));
  const blockedTasks = tasks.filter((item) => ["blocked", "failed", "risk", "overdue"].includes(String(item.status || "").toLowerCase()));
  const completedTasks = tasks.filter((item) => ["done", "complete", "completed", "sent", "published"].includes(String(item.status || "").toLowerCase()));
  const checkedRuns = runs.filter((item) => item.seo_check && item.rss_check && item.image_check && item.link_check);
  const followups = runs.filter((item) => item.followup_needed && !["done", "complete", "completed"].includes(String(item.status || "").toLowerCase())).length;

  const score = Math.max(0, Math.min(100,
    Math.min(25, activeChannels.length * 6) +
    Math.min(15, primaryChannels.length * 5) +
    Math.min(20, openRuns.length * 5) +
    Math.min(20, checkedRuns.length * 10) +
    Math.min(20, completedTasks.length * 4) -
    Math.min(35, blockedTasks.length * 12) -
    Math.min(15, followups * 4)
  ));

  return { score, channels, runs, tasks, activeChannels, primaryChannels, openRuns, blockedTasks, completedTasks, checkedRuns, followups };
}
