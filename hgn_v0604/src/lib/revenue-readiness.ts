import { supabase } from "@/lib/supabase";

export type RevenueRow = Record<string, any>;

export function revenueTone(status?: string | null, priority?: string | null) {
  const value = String(status || "").toLowerCase();
  const level = String(priority || "").toLowerCase();
  if (["ready", "active", "approved", "won", "sent"].includes(value)) return "good";
  if (["blocked", "overdue", "lost"].includes(value) || ["urgent", "high"].includes(level)) return "bad";
  if (["review", "draft", "pending", "contacted"].includes(value)) return "warn";
  return "neutral";
}

export function revenueToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

async function readTable(table: string, order = "created_at") {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending: false }).limit(100);
  if (error) return [] as RevenueRow[];
  return (data || []) as RevenueRow[];
}

export async function getRevenueReadinessSnapshot() {
  const [packages, prospects, assets, tasks] = await Promise.all([
    readTable("ad_packages", "sort_order"),
    readTable("advertiser_prospects", "created_at"),
    readTable("sponsor_assets", "created_at"),
    readTable("revenue_readiness_tasks", "created_at"),
  ]);

  const readyPackages = packages.filter((item) => ["active", "ready", "approved"].includes(String(item.status || "").toLowerCase())).length;
  const liveAssets = assets.filter((item) => ["approved", "active", "live"].includes(String(item.status || "").toLowerCase())).length;
  const warmProspects = prospects.filter((item) => ["contacted", "proposal", "won"].includes(String(item.status || "").toLowerCase())).length;
  const blockers = tasks.filter((item) => ["blocked", "overdue"].includes(String(item.status || "").toLowerCase()) || ["urgent", "high"].includes(String(item.priority || "").toLowerCase()));
  const doneTasks = tasks.filter((item) => ["done", "ready"].includes(String(item.status || "").toLowerCase())).length;

  const scoreParts = [
    packages.length ? Math.min(30, readyPackages * 10) : 0,
    prospects.length ? Math.min(25, warmProspects * 5) : 0,
    assets.length ? Math.min(20, liveAssets * 5) : 0,
    tasks.length ? Math.min(25, doneTasks * 5) : 0,
  ];
  const penalty = Math.min(25, blockers.length * 8);
  const score = Math.max(0, Math.min(100, scoreParts.reduce((sum, value) => sum + value, 0) - penalty));

  return {
    score,
    packages,
    prospects,
    assets,
    tasks,
    readyPackages,
    liveAssets,
    warmProspects,
    blockers,
  };
}
