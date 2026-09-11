import { supabase } from "@/lib/supabase";

export type BetaRow = Record<string, any>;

export async function safeCount(table: string, build?: (q: any) => any) {
  try {
    let query = supabase.from(table).select("id", { count: "exact", head: true });
    if (build) query = build(query);
    const { count, error } = await query;
    if (error) return null;
    return count || 0;
  } catch {
    return null;
  }
}

export async function safeRows(table: string, order = "created_at", limit = 10, ascending = false) {
  try {
    const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
    if (error) return [] as BetaRow[];
    return (data || []) as BetaRow[];
  } catch {
    return [] as BetaRow[];
  }
}

export function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function statusTone(status: string | null | undefined) {
  const s = String(status || "").toLowerCase();
  if (["resolved", "fixed", "done", "green", "published", "complete"].includes(s)) return "good";
  if (["monitoring", "watching", "review", "in_review", "yellow", "scheduled"].includes(s)) return "warn";
  if (["open", "blocked", "red", "incident", "critical"].includes(s)) return "bad";
  return "neutral";
}

export function toneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getBetaOpsSnapshot() {
  const [
    published,
    draftQueue,
    openFeedback,
    openIncidents,
    releaseNotes,
    incidents,
    siteChecks,
    sessions,
    checklist,
  ] = await Promise.all([
    safeCount("articles", (q) => q.eq("status", "published")),
    safeCount("articles", (q) => q.in("status", ["draft", "review", "scheduled"])),
    safeCount("beta_feedback", (q) => q.in("status", ["new", "open", "in_review"])),
    safeCount("beta_incidents", (q) => q.in("status", ["open", "monitoring"])),
    safeRows("beta_release_notes", "published_at", 6),
    safeRows("beta_incidents", "created_at", 8),
    safeRows("beta_site_checks", "sort_order", 20, true),
    safeRows("beta_test_sessions", "created_at", 6),
    safeRows("launch_checklist", "priority", 50),
  ]);

  const done = checklist.filter((item) => ["done", "fixed", "complete"].includes(String(item.status || "").toLowerCase())).length;
  const blockers = checklist.filter((item) => item.blocking && !["done", "fixed", "complete"].includes(String(item.status || "").toLowerCase())).length;
  const readiness = Math.max(0, Math.min(100, percent(done, checklist.length) - blockers * 8));

  return {
    published: published || 0,
    draftQueue: draftQueue || 0,
    openFeedback: openFeedback || 0,
    openIncidents: openIncidents || 0,
    readiness,
    checklistDone: done,
    checklistTotal: checklist.length,
    blockers,
    releaseNotes,
    incidents,
    siteChecks,
    sessions,
    checklist,
  };
}
