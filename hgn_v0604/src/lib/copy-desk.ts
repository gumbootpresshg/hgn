import { supabase } from "@/lib/supabase";

export type CopyDeskRow = Record<string, any>;

async function safeSelect(table: string, order = "created_at", limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending: false }).limit(limit);
  if (error) return [] as CopyDeskRow[];
  return (data || []) as CopyDeskRow[];
}

export function copyDeskTone(status?: string, priority?: string, blocker?: boolean) {
  const value = `${status || ""} ${priority || ""}`.toLowerCase();
  if (blocker || value.includes("blocked") || value.includes("urgent")) return "bad";
  if (value.includes("needs") || value.includes("review") || value.includes("high")) return "warn";
  if (value.includes("ready") || value.includes("done") || value.includes("fixed") || value.includes("approved")) return "good";
  return "neutral";
}

export function copyDeskToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getCopyDeskSnapshot() {
  const [items, checks, notes] = await Promise.all([
    safeSelect("copy_desk_items", "updated_at", 120),
    safeSelect("copy_desk_checklist", "sort_order", 80),
    safeSelect("copy_desk_style_notes", "updated_at", 80),
  ]);

  const activeItems = items.filter((item) => !["done", "fixed", "approved", "archived"].includes(String(item.status || "").toLowerCase()));
  const blockers = activeItems.filter((item) => item.publish_blocker || ["blocked", "urgent"].includes(String(item.status || "").toLowerCase()));
  const homepageSensitive = activeItems.filter((item) => item.homepage_sensitive);
  const activeChecks = checks.filter((check) => check.active !== false);
  const requiredChecks = activeChecks.filter((check) => check.required_before_publish !== false);
  const activeNotes = notes.filter((note) => !["archived", "closed"].includes(String(note.status || "").toLowerCase()));

  let score = 55;
  if (blockers.length === 0) score += 20;
  if (activeItems.length <= 5) score += 10;
  if (homepageSensitive.length <= 2) score += 5;
  if (requiredChecks.length >= 4) score += 10;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, items, checks, notes, activeItems, blockers, homepageSensitive, activeChecks, requiredChecks, activeNotes };
}
