import { safeRows } from "@/lib/beta-ops";

export type CommsRow = Record<string, any>;

export function commsTone(status?: string | null) {
  const s = String(status || "").toLowerCase();
  if (["sent", "published", "approved", "green"].includes(s)) return "good";
  if (["review", "scheduled", "draft", "yellow"].includes(s)) return "warn";
  if (["blocked", "cancelled", "red"].includes(s)) return "bad";
  return "neutral";
}

export function commsToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-white text-slate-900";
}

function isReady(status?: string | null) {
  return ["approved", "scheduled", "sent", "published"].includes(String(status || "").toLowerCase());
}

export async function getLaunchCommsSnapshot() {
  const [queue, templates, updates, testers, releases] = await Promise.all([
    safeRows("beta_comms_queue", "send_at", 60),
    safeRows("beta_comms_templates", "created_at", 40),
    safeRows("beta_update_posts", "published_at", 40),
    safeRows("beta_testers", "created_at", 80),
    safeRows("beta_release_notes", "published_at", 8),
  ]);

  const queued = queue.filter((item) => ["draft", "review"].includes(String(item.status || "").toLowerCase())).length;
  const ready = queue.filter((item) => isReady(item.status)).length;
  const publicUpdates = updates.filter((item) => String(item.visibility || "").toLowerCase() === "public" && isReady(item.status)).length;
  const internalUpdates = updates.filter((item) => String(item.visibility || "").toLowerCase() !== "public").length;
  const activeTesters = testers.filter((item) => ["active", "complete"].includes(String(item.status || "").toLowerCase())).length;
  const templateScore = templates.length ? Math.min(100, templates.length * 18) : 0;
  const queueScore = Math.min(100, ready * 20 + Math.max(0, 25 - queued * 5));
  const updateScore = Math.min(100, publicUpdates * 25 + internalUpdates * 8);
  const testerScore = Math.min(100, activeTesters * 8);
  const score = Math.round((templateScore + queueScore + updateScore + testerScore) / 4);

  return {
    queue,
    templates,
    updates,
    releases,
    testers,
    queued,
    ready,
    publicUpdates,
    internalUpdates,
    activeTesters,
    score,
  };
}
