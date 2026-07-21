import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function storyPolishToneClasses(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  if (tone === "blue") return "border-blue-200 bg-blue-50 text-blue-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function toneForPolishItem(item: Row) {
  const status = String(item.item_status || "").toLowerCase();
  const priority = String(item.priority || "").toLowerCase();
  if (status === "blocked" || priority === "urgent") return "bad";
  if (status === "needs polish" || status === "needs review" || priority === "high") return "warn";
  if (status === "done" || item.is_done) return "good";
  if (status === "waiting") return "blue";
  return "neutral";
}

export async function getStoryPolishSnapshot() {
  const [items, checks] = await Promise.all([
    safeSelect("story_polish_items", "sort_order", true, 100),
    safeSelect("story_polish_checks", "sort_order", true, 50),
  ]);

  const open = items.filter((item) => !item.is_done && !["done", "dropped"].includes(String(item.item_status || "").toLowerCase()));
  const blocked = items.filter((item) => String(item.item_status || "").toLowerCase() === "blocked" || String(item.priority || "").toLowerCase() === "urgent");
  const needsPolish = items.filter((item) => ["needs polish", "needs review"].includes(String(item.item_status || "").toLowerCase()));
  const readyChecks = checks.filter((check) => Boolean(check.is_ready)).length;
  const checkScore = checks.length ? Math.round((readyChecks / checks.length) * 100) : 70;

  let score = checkScore;
  if (open.length > 0 && open.length <= 4) score += 8;
  if (needsPolish.length > 3) score -= 12;
  if (blocked.length > 0) score -= 25;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, items, checks, open, blocked, needsPolish };
}
