import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function dailyRouteTone(status: string, group?: string) {
  const value = String(status || "").toLowerCase();
  const kind = String(group || "").toLowerCase();
  if (value === "active" && kind === "daily") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (value === "active") return "border-blue-200 bg-blue-50 text-blue-950";
  if (["review", "cleanup"].includes(value) || kind === "cleanup") return "border-amber-200 bg-amber-50 text-amber-950";
  if (["parked", "hidden"].includes(value)) return "border-slate-200 bg-slate-50 text-slate-700";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getDailyRouteSnapshot() {
  const [steps, notes] = await Promise.all([
    safeSelect("daily_route_steps", "sort_order", true, 80),
    safeSelect("daily_route_notes", "created_at", false, 20),
  ]);

  const daily = steps.filter((step) => String(step.step_group || "").toLowerCase() === "daily");
  const cleanup = steps.filter((step) => String(step.step_group || "").toLowerCase() === "cleanup");
  const activeNotes = notes.filter((note) => String(note.note_status || "").toLowerCase() !== "closed");

  let score = 90;
  score += Math.min(daily.length, 5) * 2;
  score += Math.min(cleanup.length, 3) * 2;
  score -= Math.max(0, daily.length - 5) * 6;
  score -= Math.max(0, steps.length - 9) * 4;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { steps, notes, daily, cleanup, activeNotes, score };
}
