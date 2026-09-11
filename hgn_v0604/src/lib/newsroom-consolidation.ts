import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function hubTone(tone: string) {
  if (tone === "good") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-950";
  if (tone === "bad") return "border-rose-200 bg-rose-50 text-rose-950";
  if (tone === "blue") return "border-blue-200 bg-blue-50 text-blue-950";
  return "border-slate-200 bg-white text-slate-900";
}

export function toneForHubItem(item: Row) {
  const status = String(item.item_status || "").toLowerCase();
  const area = String(item.area || "").toLowerCase();
  const priority = String(item.priority || "").toLowerCase();

  if (["done", "shipped", "clear"].includes(status)) return "good";
  if (["blocked", "problem", "stuck"].includes(status) || priority === "urgent") return "bad";
  if (["ready", "next"].includes(status)) return "blue";
  if (["homepage", "publishing", "live"].includes(area) || priority === "today") return "warn";
  return "neutral";
}

export async function getNewsroomHubSnapshot() {
  const [items, links, notes] = await Promise.all([
    safeSelect("newsroom_hub_items", "sort_order", true, 100),
    safeSelect("newsroom_hub_links", "sort_order", true, 60),
    safeSelect("newsroom_hub_notes", "created_at", false, 20),
  ]);

  const active = items.filter((item) => !["done", "shipped", "dropped", "clear"].includes(String(item.item_status || "").toLowerCase()));
  const ready = active.filter((item) => ["ready", "next"].includes(String(item.item_status || "").toLowerCase()));
  const blocked = active.filter((item) => ["blocked", "problem", "stuck"].includes(String(item.item_status || "").toLowerCase()) || String(item.priority || "").toLowerCase() === "urgent");
  const homepage = active.filter((item) => String(item.area || "").toLowerCase() === "homepage");
  const publishing = active.filter((item) => String(item.area || "").toLowerCase() === "publishing");
  const live = active.filter((item) => String(item.area || "").toLowerCase() === "live");
  const visibleLinks = links.filter((link) => String(link.link_status || "visible").toLowerCase() !== "hidden");
  const doneLinks = visibleLinks.filter((link) => ["primary", "keep"].includes(String(link.link_status || "").toLowerCase())).length;

  let score = 78;
  score += Math.min(10, ready.length * 3);
  score += homepage.length ? 3 : 0;
  score += publishing.length ? 3 : 0;
  score -= Math.min(28, blocked.length * 14);
  score -= active.length > 7 ? 8 : 0;
  score -= visibleLinks.length > 9 ? 6 : 0;
  score += doneLinks ? 3 : 0;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, items, links: visibleLinks, notes, active, ready, blocked, homepage, publishing, live };
}
