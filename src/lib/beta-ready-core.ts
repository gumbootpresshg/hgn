import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "updated_at", ascending = false, limit = 50) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function coreToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getBetaReadyCoreSnapshot() {
  const [coreTasks, publishItems, homepageSlots, liveItems, handoffs] = await Promise.all([
    safeSelect("beta_ready_core_tasks", "sort_order", true, 100),
    safeSelect("publish_sweep_items", "sort_order", true, 80),
    safeSelect("homepage_focus_slots", "sort_order", true, 20),
    safeSelect("live_desk_updates", "updated_at", false, 20),
    safeSelect("handoff_notes", "updated_at", false, 20),
  ]);

  const openCoreTasks = coreTasks.filter((task) => !["done", "cleared", "dropped"].includes(String(task.status || "").toLowerCase()));
  const blockers = [...coreTasks, ...publishItems].filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return item.is_blocking || status === "blocked" || status === "needs_fix";
  });
  const doneTasks = coreTasks.filter((task) => ["done", "cleared"].includes(String(task.status || "").toLowerCase()));

  let score = 70;
  if (blockers.length === 0) score += 15;
  if (doneTasks.length > 0) score += 10;
  if (openCoreTasks.length > 8) score -= 10;
  if (blockers.length > 0) score -= 25;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    coreTasks,
    openCoreTasks,
    blockers,
    doneTasks,
    publishItems,
    homepageSlots,
    liveItems,
    handoffs,
  };
}
