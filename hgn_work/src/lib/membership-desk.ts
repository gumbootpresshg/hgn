import { supabase } from "@/lib/supabase";

export type MembershipRow = Record<string, any>;

export function membershipTone(status?: string | null, priority?: string | null) {
  const s = String(status || "").toLowerCase();
  const p = String(priority || "").toLowerCase();
  if (["blocked", "failed", "risk", "overdue", "cancelled"].includes(s) || p === "urgent") return "bad";
  if (["ready", "active", "live", "done", "complete", "completed", "converted"].includes(s)) return "good";
  if (["draft", "planned", "todo", "interested", "contacted", "review", "waitlist", "in progress", "doing"].includes(s) || p === "high") return "warn";
  return "neutral";
}

export function membershipToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

async function readTable(table: string, order = "created_at", ascending = false) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(100);
  if (error) return [] as MembershipRow[];
  return (data || []) as MembershipRow[];
}

export async function getMembershipSnapshot() {
  const [plans, prospects, benefits, tasks] = await Promise.all([
    readTable("member_plans", "sort_order", true),
    readTable("member_prospects", "created_at", false),
    readTable("member_benefits", "sort_order", true),
    readTable("membership_tasks", "due_at", true),
  ]);

  const publicPlans = plans.filter((item) => item.is_public && ["review", "ready", "active", "live"].includes(String(item.status || "").toLowerCase()));
  const readyPlans = plans.filter((item) => ["ready", "active", "live"].includes(String(item.status || "").toLowerCase()));
  const warmProspects = prospects.filter((item) => ["interested", "contacted", "waitlist", "pledged", "converted"].includes(String(item.status || "").toLowerCase()));
  const convertedProspects = prospects.filter((item) => ["converted", "member"].includes(String(item.status || "").toLowerCase()));
  const launchBenefits = benefits.filter((item) => item.launch_required);
  const readyBenefits = benefits.filter((item) => ["ready", "active", "live"].includes(String(item.status || "").toLowerCase()));
  const blockers = tasks.filter((item) => ["blocked", "risk", "overdue"].includes(String(item.status || "").toLowerCase()) || String(item.priority || "").toLowerCase() === "urgent");
  const doneTasks = tasks.filter((item) => ["done", "complete", "completed", "ready"].includes(String(item.status || "").toLowerCase()));
  const paymentReady = tasks.some((item) => String(item.area || "").toLowerCase().includes("payment") && ["ready", "done", "complete", "completed"].includes(String(item.status || "").toLowerCase()));

  const score = Math.max(0, Math.min(100,
    Math.min(25, publicPlans.length * 12) +
    Math.min(20, readyPlans.length * 10) +
    Math.min(15, warmProspects.length * 3) +
    Math.min(15, readyBenefits.length * 5) +
    Math.min(15, doneTasks.length * 4) +
    (paymentReady ? 10 : 0) -
    Math.min(35, blockers.length * 12) -
    Math.max(0, launchBenefits.length - readyBenefits.length) * 4
  ));

  return { score, plans, prospects, benefits, tasks, publicPlans, readyPlans, warmProspects, convertedProspects, launchBenefits, readyBenefits, blockers, doneTasks, paymentReady };
}
