import { supabase } from "@/lib/supabase";

export type WorkbenchRow = Record<string, any>;

async function safeSelect(table: string, order = "created_at") {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending: false }).limit(80);
  if (error) return [] as WorkbenchRow[];
  return (data || []) as WorkbenchRow[];
}

export function workbenchTone(status?: string, priority?: string) {
  const value = `${status || ""} ${priority || ""}`.toLowerCase();
  if (value.includes("blocked") || value.includes("urgent") || value.includes("overdue")) return "bad";
  if (value.includes("needs") || value.includes("draft") || value.includes("review") || value.includes("high")) return "warn";
  if (value.includes("ready") || value.includes("published") || value.includes("done") || value.includes("complete")) return "good";
  return "neutral";
}

export function workbenchToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-900";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getEditorWorkbenchSnapshot() {
  const [items, notes, slots, snapshots] = await Promise.all([
    safeSelect("editor_workbench_items", "updated_at"),
    safeSelect("editor_workbench_notes"),
    safeSelect("homepage_slots", "slot_order"),
    safeSelect("draft_recovery_snapshots"),
  ]);

  const activeItems = items.filter((item) => !["published", "done", "archived"].includes(String(item.status || "").toLowerCase()));
  const readyItems = items.filter((item) => String(item.status || "").toLowerCase().includes("ready"));
  const blockedItems = items.filter((item) => workbenchTone(item.status, item.priority) === "bad");
  const emptySlots = slots.filter((item) => !item.article_title && !item.article_slug);
  const openNotes = notes.filter((item) => !["done", "archived"].includes(String(item.status || "").toLowerCase()));

  let score = 45;
  if (readyItems.length >= 1) score += 15;
  if (blockedItems.length === 0) score += 15;
  if (emptySlots.length <= 2) score += 10;
  if (openNotes.length <= 5) score += 10;
  if (snapshots.length >= 1) score += 5;
  score = Math.max(0, Math.min(100, score));

  return { score, items, notes, slots, snapshots, activeItems, readyItems, blockedItems, emptySlots, openNotes };
}
