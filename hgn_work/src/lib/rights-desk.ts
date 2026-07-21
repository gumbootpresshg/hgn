import { supabase } from "@/lib/supabase";

export type RightsRow = Record<string, any>;

export function rightsTone(status?: string | null, priority?: string | null) {
  const s = String(status || "").toLowerCase();
  const p = String(priority || "").toLowerCase();
  if (["blocked", "disputed", "expired", "missing", "new", "urgent"].includes(s) || p === "urgent") return "bad";
  if (["approved", "cleared", "complete", "done", "resolved", "signed", "licensed"].includes(s)) return "good";
  if (["needed", "needs-review", "review", "todo", "in-progress", "pending"].includes(s) || p === "high") return "warn";
  return "neutral";
}

export function rightsToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

async function readTable(table: string, order = "created_at", ascending = false) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(100);
  if (error) return [] as RightsRow[];
  return (data || []) as RightsRow[];
}

function isCleared(status: unknown) {
  return ["approved", "cleared", "complete", "done", "resolved", "signed", "licensed"].includes(String(status || "").toLowerCase());
}

export async function getRightsDeskSnapshot() {
  const [assets, releases, takedowns, tasks] = await Promise.all([
    readTable("content_rights_assets", "updated_at", false),
    readTable("content_release_forms", "created_at", false),
    readTable("takedown_requests", "created_at", false),
    readTable("rights_review_tasks", "created_at", false),
  ]);

  const clearedAssets = assets.filter((item) => isCleared(item.license_status));
  const needsReviewAssets = assets.filter((item) => !isCleared(item.license_status));
  const signedReleases = releases.filter((item) => isCleared(item.status));
  const openReleases = releases.filter((item) => !isCleared(item.status));
  const openTakedowns = takedowns.filter((item) => !isCleared(item.status));
  const urgentTakedowns = takedowns.filter((item) => ["urgent", "high"].includes(String(item.priority || "").toLowerCase()) && !isCleared(item.status));
  const openTasks = tasks.filter((item) => !isCleared(item.status));

  const assetScore = assets.length ? Math.round((clearedAssets.length / assets.length) * 35) : 10;
  const releaseScore = releases.length ? Math.round((signedReleases.length / releases.length) * 20) : 8;
  const taskPenalty = Math.min(25, openTasks.length * 4);
  const takedownPenalty = Math.min(35, openTakedowns.length * 8 + urgentTakedowns.length * 8);
  const score = Math.max(0, Math.min(100, assetScore + releaseScore + 35 - taskPenalty - takedownPenalty));

  return { score, assets, releases, takedowns, tasks, clearedAssets, needsReviewAssets, signedReleases, openReleases, openTakedowns, urgentTakedowns, openTasks };
}
