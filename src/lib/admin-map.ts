import { supabase } from "@/lib/supabase";

type Row = Record<string, any>;

async function safeSelect(table: string, order = "sort_order", ascending = true, limit = 100) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(limit);
  if (error) return [] as Row[];
  return (data || []) as Row[];
}

export function adminMapTone(status: string) {
  const value = String(status || "").toLowerCase();
  if (value === "primary") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (value === "occasional") return "border-blue-200 bg-blue-50 text-blue-950";
  if (value === "parked") return "border-slate-200 bg-slate-50 text-slate-700";
  if (value === "hide") return "border-rose-200 bg-rose-50 text-rose-950";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getAdminMapSnapshot() {
  const [tools, notes] = await Promise.all([
    safeSelect("admin_map_tools", "sort_order", true, 100),
    safeSelect("admin_map_notes", "created_at", false, 20),
  ]);

  const primary = tools.filter((tool) => String(tool.tool_status || "").toLowerCase() === "primary");
  const occasional = tools.filter((tool) => String(tool.tool_status || "").toLowerCase() === "occasional");
  const parked = tools.filter((tool) => String(tool.tool_status || "").toLowerCase() === "parked");
  const hidden = tools.filter((tool) => String(tool.tool_status || "").toLowerCase() === "hide");

  let score = 86;
  score -= Math.max(0, primary.length - 4) * 7;
  score -= Math.max(0, occasional.length - 5) * 3;
  score += parked.length ? 4 : 0;
  score += hidden.length ? 2 : 0;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { tools, notes, primary, occasional, parked, hidden, score };
}
