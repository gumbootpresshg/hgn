import { supabase } from "@/lib/supabase";

export type EditorialRow = Record<string, any>;

export function calendarTone(status?: string | null) {
  const s = String(status || "").toLowerCase();
  if (["scheduled", "ready", "published", "complete", "completed", "open"].includes(s)) return "good";
  if (["blocked", "overdue", "risk", "cancelled", "killed"].includes(s)) return "bad";
  if (["planned", "draft", "editing", "review", "idea", "watch"].includes(s)) return "warn";
  return "neutral";
}

export function calendarToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

async function readTable(table: string, order = "created_at", ascending = false) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(100);
  if (error) return [] as EditorialRow[];
  return (data || []) as EditorialRow[];
}

export async function getEditorialCalendarSnapshot() {
  const [calendar, budget, windows] = await Promise.all([
    readTable("editorial_calendar_items", "publish_date", true),
    readTable("story_budget_items", "due_date", true),
    readTable("publishing_windows", "window_date", true),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const activeCalendar = calendar.filter((item) => !["published", "complete", "completed", "cancelled", "killed"].includes(String(item.status || "").toLowerCase()));
  const blockers = budget.filter((item) => String(item.blocker || "").trim() || ["blocked", "risk"].includes(String(item.status || "").toLowerCase())).length;
  const betaCritical = calendar.filter((item) => item.is_beta_critical).length;
  const todayItems = calendar.filter((item) => String(item.publish_date || "") === today).length;
  const readyItems = calendar.filter((item) => ["ready", "scheduled", "published"].includes(String(item.status || "").toLowerCase())).length;
  const openWindows = windows.filter((item) => ["open", "ready"].includes(String(item.status || "").toLowerCase())).length;

  const score = Math.max(0, Math.min(100,
    Math.min(25, activeCalendar.length * 5) +
    Math.min(20, readyItems * 8) +
    Math.min(15, todayItems * 8) +
    Math.min(15, openWindows * 8) +
    Math.min(15, betaCritical * 5) +
    Math.min(10, budget.length * 2) -
    Math.min(30, blockers * 10)
  ));

  return { score, calendar, budget, windows, activeCalendar, blockers, betaCritical, todayItems, readyItems, openWindows };
}
