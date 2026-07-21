import { supabase } from "@/lib/supabase";

export type HandoffRow = Record<string, any>;

async function safeSelect(table: string, order = "updated_at", ascending = false, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as HandoffRow[];
  return (data || []) as HandoffRow[];
}

export function handoffTone(status?: string, needsReply?: boolean, rank?: number) {
  const value = String(status || "").toLowerCase();
  if (value.includes("blocked") || value.includes("urgent") || needsReply) return "bad";
  if (value.includes("doing") || value.includes("review") || value.includes("planned") || (rank || 99) <= 2) return "warn";
  if (value.includes("done") || value.includes("resolved") || value.includes("archived")) return "good";
  return "neutral";
}

export function handoffToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getHandoffSnapshot() {
  const [notes, priorities, decisions] = await Promise.all([
    safeSelect("newsroom_handoff_notes", "updated_at", false, 100),
    safeSelect("newsroom_daily_priorities", "rank", true, 100),
    safeSelect("newsroom_decision_log", "updated_at", false, 100),
  ]);

  const openNotes = notes.filter((note) => !["done", "resolved", "archived"].includes(String(note.status || "").toLowerCase()));
  const needsReply = notes.filter((note) => note.needs_reply && !["done", "resolved", "archived"].includes(String(note.status || "").toLowerCase()));
  const openPriorities = priorities.filter((item) => !["done", "dropped", "archived"].includes(String(item.status || "").toLowerCase()));
  const activeDecisions = decisions.filter((decision) => String(decision.status || "").toLowerCase() === "active");

  let score = 70;
  if (needsReply.length === 0) score += 10;
  if (openPriorities.length <= 5) score += 10;
  if (activeDecisions.length > 0) score += 5;
  if (openNotes.length > 8) score -= 10;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, notes, openNotes, needsReply, priorities, openPriorities, decisions, activeDecisions };
}
