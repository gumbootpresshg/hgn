import { supabase } from "@/lib/supabase";

export type HomepageControlRow = Record<string, any>;

async function safeSelect(table: string, order = "created_at", ascending = false, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as HomepageControlRow[];
  return (data || []) as HomepageControlRow[];
}

export function homepageControlTone(status?: string, priority?: string) {
  const value = `${status || ""} ${priority || ""}`.toLowerCase();
  if (value.includes("blocked") || value.includes("stale") || value.includes("urgent")) return "bad";
  if (value.includes("empty") || value.includes("todo") || value.includes("needs") || value.includes("high")) return "warn";
  if (value.includes("ready") || value.includes("filled") || value.includes("done") || value.includes("current")) return "good";
  return "neutral";
}

export function homepageControlToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function isHomepageSlotStale(slot: HomepageControlRow) {
  if (!slot?.published_at || !slot?.freshness_hours) return false;
  const published = new Date(slot.published_at).getTime();
  if (Number.isNaN(published)) return false;
  const ageHours = (Date.now() - published) / 36e5;
  return ageHours > Number(slot.freshness_hours || 24);
}

export async function getHomepageControlSnapshot() {
  const [slots, checks, snapshots] = await Promise.all([
    safeSelect("homepage_control_slots", "slot_order", true, 50),
    safeSelect("homepage_control_checks", "updated_at", false, 80),
    safeSelect("homepage_control_snapshots", "created_at", false, 10),
  ]);

  const visibleSlots = slots.filter((slot) => slot.is_visible);
  const emptySlots = visibleSlots.filter((slot) => !slot.article_slug && !slot.story_title && !["hidden", "off"].includes(String(slot.status || "").toLowerCase()));
  const staleSlots = visibleSlots.filter((slot) => isHomepageSlotStale(slot) || String(slot.status || "").toLowerCase().includes("stale"));
  const pinnedSlots = visibleSlots.filter((slot) => slot.is_pinned);
  const openChecks = checks.filter((check) => !["done", "complete", "closed"].includes(String(check.status || "").toLowerCase()));
  const urgentChecks = openChecks.filter((check) => ["high", "urgent"].includes(String(check.priority || "").toLowerCase()));

  let score = 45;
  if (visibleSlots.length >= 3) score += 10;
  if (emptySlots.length <= 1) score += 20;
  if (staleSlots.length === 0) score += 15;
  if (urgentChecks.length <= 1) score += 5;
  if (pinnedSlots.length <= 2) score += 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, slots, checks, snapshots, visibleSlots, emptySlots, staleSlots, pinnedSlots, openChecks, urgentChecks };
}
