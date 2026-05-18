import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function releaseCandidateTone(status: string, kind?: string) {
  const value = String(status || "").toLowerCase();
  const group = String(kind || "").toLowerCase();
  if (["ready", "done", "keep"].includes(value)) return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (["review", "occasional"].includes(value)) return "border-amber-200 bg-amber-50 text-amber-950";
  if (["risk", "blocked"].includes(value) || group === "risk") return "border-red-200 bg-red-50 text-red-950";
  if (["parked", "hidden", "later"].includes(value)) return "border-slate-200 bg-slate-50 text-slate-700";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getReleaseCandidateSnapshot() {
  const [checks, routes, notes] = await Promise.all([
    safeSelect("release_candidate_checks", "sort_order", true, 80),
    safeSelect("release_candidate_routes", "sort_order", true, 80),
    safeSelect("release_candidate_notes", "created_at", false, 20),
  ]);

  const readyChecks = checks.filter((check) => ["ready", "done"].includes(String(check.check_status || "").toLowerCase()));
  const reviewChecks = checks.filter((check) => ["review", "risk", "blocked"].includes(String(check.check_status || "").toLowerCase()));
  const primaryRoutes = routes.filter((route) => String(route.route_group || "").toLowerCase() === "primary");
  const occasionalRoutes = routes.filter((route) => String(route.route_group || "").toLowerCase() !== "primary");
  const openNotes = notes.filter((note) => String(note.note_status || "").toLowerCase() !== "closed");

  let score = 72;
  score += Math.min(readyChecks.length, 8) * 4;
  score += Math.min(primaryRoutes.length, 5) * 2;
  score -= reviewChecks.length * 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { checks, routes, notes, readyChecks, reviewChecks, primaryRoutes, occasionalRoutes, openNotes, score };
}
