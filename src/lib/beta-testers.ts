import { safeRows } from "@/lib/beta-ops";

export type TesterRow = Record<string, any>;

export function testerTone(status?: string | null) {
  const s = String(status || "").toLowerCase();
  if (["active", "complete", "done", "sent"].includes(s)) return "good";
  if (["new", "invited", "ready", "draft"].includes(s)) return "warn";
  if (["paused", "declined", "closed"].includes(s)) return "bad";
  return "neutral";
}

export function testerToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getBetaTesterSnapshot() {
  const [testers, batches, tasks] = await Promise.all([
    safeRows("beta_testers", "created_at", 80),
    safeRows("beta_invite_batches", "created_at", 20),
    safeRows("beta_onboarding_tasks", "sort_order", 30, true),
  ]);

  const active = testers.filter((t) => ["active", "complete"].includes(String(t.status || "").toLowerCase())).length;
  const invited = testers.filter((t) => String(t.status || "").toLowerCase() === "invited").length;
  const waiting = testers.filter((t) => String(t.status || "").toLowerCase() === "new").length;
  const priority = testers.filter((t) => ["high", "critical"].includes(String(t.priority || "").toLowerCase())).length;
  const completedTasks = tasks.filter((t) => ["done"].includes(String(t.status || "").toLowerCase())).length;
  const activeTasks = tasks.filter((t) => String(t.status || "").toLowerCase() === "active").length;
  const onboardingScore = tasks.length ? Math.round(((completedTasks + activeTasks * 0.55) / tasks.length) * 100) : 0;
  const testerScore = Math.min(100, active * 8 + invited * 4 + waiting * 2 + priority * 2);
  const score = Math.round((testerScore + onboardingScore) / 2);

  return {
    testers,
    batches,
    tasks,
    active,
    invited,
    waiting,
    priority,
    completedTasks,
    activeTasks,
    onboardingScore,
    testerScore,
    score,
  };
}
