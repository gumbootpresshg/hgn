export type BotRunStatus = "success" | "warning" | "failed" | "running";

export type BotRun = {
  id?: string;
  bot_name: string;
  status: BotRunStatus;
  message?: string | null;
  source_count?: number | null;
  item_count?: number | null;
  started_at?: string | null;
  finished_at?: string | null;
  created_at?: string | null;
};

export function movementLabel(movement?: number | null) {
  if (movement === null || movement === undefined || movement === 0) return "—";
  if (movement > 0) return `↑ ${movement}`;
  return `↓ ${Math.abs(movement)}`;
}

export function movementTone(movement?: number | null) {
  if (movement === null || movement === undefined || movement === 0) return "text-zinc-400 bg-zinc-800/80";
  if (movement > 0) return "text-emerald-300 bg-emerald-500/15";
  return "text-red-300 bg-red-500/15";
}

export function freshnessLabel(date?: string | null) {
  if (!date) return "No run recorded";
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 60) return `${mins || 1} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} days ago`;
}

export function liveHealthFromRuns(runs: BotRun[]) {
  if (!runs.length) {
    return { label: "Needs first run", tone: "border-amber-400/30 bg-amber-500/10 text-amber-200" };
  }

  const latest = [...runs].sort((a, b) => {
    const aDate = new Date(a.finished_at || a.created_at || a.started_at || 0).getTime();
    const bDate = new Date(b.finished_at || b.created_at || b.started_at || 0).getTime();
    return bDate - aDate;
  })[0];

  if (latest.status === "failed") return { label: "Needs attention", tone: "border-red-400/30 bg-red-500/10 text-red-200" };
  if (latest.status === "warning") return { label: "Partial refresh", tone: "border-amber-400/30 bg-amber-500/10 text-amber-200" };
  if (latest.status === "running") return { label: "Running", tone: "border-blue-400/30 bg-blue-500/10 text-blue-200" };
  return { label: "Live", tone: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" };
}
