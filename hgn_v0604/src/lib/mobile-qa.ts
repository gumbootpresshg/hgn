import { supabase } from "@/lib/supabase";

export type MobileQaRow = Record<string, any>;

export function mobileTone(status?: string | null, priority?: string | null) {
  const s = String(status || "").toLowerCase();
  const p = String(priority || "").toLowerCase();
  if (["blocked", "failed", "open", "risk", "bug"].includes(s) || p === "urgent") return "bad";
  if (["passed", "pass", "ready", "done", "resolved", "green"].includes(s)) return "good";
  if (["untested", "needs-run", "review", "in progress", "todo"].includes(s) || p === "high") return "warn";
  return "neutral";
}

export function mobileToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

async function readTable(table: string, order = "created_at", ascending = false) {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending }).limit(100);
  if (error) return [] as MobileQaRow[];
  return (data || []) as MobileQaRow[];
}

export async function getMobileQaSnapshot() {
  const [tests, snapshots, blockers] = await Promise.all([
    readTable("mobile_device_tests", "created_at", false),
    readTable("mobile_lighthouse_snapshots", "measured_at", false),
    readTable("mobile_launch_blockers", "created_at", false),
  ]);

  const passedTests = tests.filter((item) => ["passed", "pass", "ready", "done"].includes(String(item.status || "").toLowerCase()));
  const untested = tests.filter((item) => ["untested", "todo", "review"].includes(String(item.status || "").toLowerCase()));
  const openBlockers = blockers.filter((item) => !["resolved", "done", "closed"].includes(String(item.status || "").toLowerCase()));
  const urgentBlockers = openBlockers.filter((item) => ["urgent", "high"].includes(String(item.priority || "").toLowerCase()));
  const lighthouseRuns = snapshots.filter((item) => Number(item.performance_score || 0) > 0 || Number(item.accessibility_score || 0) > 0);
  const latestScores = lighthouseRuns.slice(0, 5);
  const scoreAverage = latestScores.length ? Math.round(latestScores.reduce((sum, item) => sum + (Number(item.performance_score || 0) + Number(item.accessibility_score || 0) + Number(item.best_practices_score || 0) + Number(item.seo_score || 0)) / 4, 0) / latestScores.length) : 0;

  const testCoverage = tests.length ? Math.round((passedTests.length / tests.length) * 45) : 0;
  const lighthousePoints = Math.min(35, Math.round(scoreAverage * 0.35));
  const blockerPenalty = Math.min(45, openBlockers.length * 10 + urgentBlockers.length * 8);
  const score = Math.max(0, Math.min(100, testCoverage + lighthousePoints + (tests.length >= 4 ? 10 : 0) + (lighthouseRuns.length ? 10 : 0) - blockerPenalty));

  return { score, tests, snapshots, blockers, passedTests, untested, openBlockers, urgentBlockers, lighthouseRuns, scoreAverage };
}
