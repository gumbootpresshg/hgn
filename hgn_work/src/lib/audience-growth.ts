import { supabase } from "@/lib/supabase";

export type AudienceRow = Record<string, any>;

export function audienceTone(status?: string | null, priority?: string | null) {
  const value = String(status || "").toLowerCase();
  const level = String(priority || "").toLowerCase();
  if (["live", "sent", "active", "ready", "done", "approved"].includes(value)) return "good";
  if (["blocked", "paused", "failed", "overdue"].includes(value) || ["urgent", "high"].includes(level)) return "bad";
  if (["draft", "review", "queued", "planned", "testing"].includes(value)) return "warn";
  return "neutral";
}

export function audienceToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

async function readTable(table: string, order = "created_at") {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending: false }).limit(100);
  if (error) return [] as AudienceRow[];
  return (data || []) as AudienceRow[];
}

export async function getAudienceGrowthSnapshot() {
  const [campaigns, channels, tasks, experiments] = await Promise.all([
    readTable("audience_campaigns", "created_at"),
    readTable("audience_channels", "created_at"),
    readTable("audience_growth_tasks", "created_at"),
    readTable("audience_experiments", "created_at"),
  ]);

  const liveCampaigns = campaigns.filter((item) => ["live", "sent", "active"].includes(String(item.status || "").toLowerCase())).length;
  const readyChannels = channels.filter((item) => ["active", "ready", "live"].includes(String(item.status || "").toLowerCase())).length;
  const doneTasks = tasks.filter((item) => ["done", "ready"].includes(String(item.status || "").toLowerCase())).length;
  const runningExperiments = experiments.filter((item) => ["running", "live", "testing"].includes(String(item.status || "").toLowerCase())).length;
  const blockers = tasks.filter((item) => ["blocked", "overdue"].includes(String(item.status || "").toLowerCase()) || ["urgent", "high"].includes(String(item.priority || "").toLowerCase()));

  const score = Math.max(0, Math.min(100,
    Math.min(30, liveCampaigns * 10) +
    Math.min(25, readyChannels * 8) +
    Math.min(25, doneTasks * 5) +
    Math.min(20, runningExperiments * 7) -
    Math.min(25, blockers.length * 7)
  ));

  return {
    score,
    campaigns,
    channels,
    tasks,
    experiments,
    liveCampaigns,
    readyChannels,
    doneTasks,
    runningExperiments,
    blockers,
  };
}
