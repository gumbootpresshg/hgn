import { supabase } from "@/lib/supabase";

export type PublishSweepRow = Record<string, any>;

async function safeSelect(table: string, order = "updated_at", ascending = false, limit = 100) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order(order, { ascending })
    .limit(limit);

  if (error) return [] as PublishSweepRow[];
  return (data || []) as PublishSweepRow[];
}

export function sweepTone(status?: string, isBlocking?: boolean) {
  const value = String(status || "").toLowerCase();
  if (isBlocking || value === "blocked") return "bad";
  if (value === "waiting" || value === "needs_fix") return "warn";
  if (value === "done" || value === "cleared") return "good";
  return "neutral";
}

export function sweepToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getPublishSweepSnapshot() {
  const [sweeps, items] = await Promise.all([
    safeSelect("publish_sweeps", "sweep_date", false, 30),
    safeSelect("publish_sweep_items", "sort_order", true, 100),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const todaySweep = sweeps.find((sweep) => String(sweep.sweep_date || "") === today) || sweeps[0] || null;
  const openItems = items.filter((item) => !["done", "cleared", "dropped"].includes(String(item.status || "").toLowerCase()));
  const blockers = items.filter((item) => item.is_blocking || String(item.status || "").toLowerCase() === "blocked");
  const clearedItems = items.filter((item) => ["done", "cleared"].includes(String(item.status || "").toLowerCase()));

  let score = 65;
  if (todaySweep) score += 10;
  if (blockers.length === 0) score += 15;
  if (clearedItems.length > 0) score += 10;
  if (openItems.length > 8) score -= 10;
  if (blockers.length > 0) score -= 25;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, sweeps, items, todaySweep, openItems, blockers, clearedItems };
}
