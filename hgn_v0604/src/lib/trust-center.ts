import { safeRows } from "@/lib/beta-ops";

export type TrustRow = Record<string, any>;

export function trustTone(status?: string | null, severity?: string | null) {
  const s = String(status || "").toLowerCase();
  const sev = String(severity || "").toLowerCase();
  if (["urgent", "high"].includes(sev) && !["resolved", "published", "archived"].includes(s)) return "bad";
  if (["published", "resolved"].includes(s)) return "good";
  if (["review", "triage", "accepted", "draft", "new"].includes(s)) return "warn";
  if (["declined", "archived"].includes(s)) return "neutral";
  return "neutral";
}

export function trustToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-white text-slate-900";
}

export async function getTrustCenterSnapshot() {
  const [items, requests] = await Promise.all([
    safeRows("trust_items", "created_at", 80),
    safeRows("correction_requests", "created_at", 80),
  ]);

  const publicItems = items.filter((item) => ["published", "resolved"].includes(String(item.status || "").toLowerCase()));
  const openItems = items.filter((item) => ["draft", "review"].includes(String(item.status || "").toLowerCase()));
  const openRequests = requests.filter((item) => ["new", "triage", "accepted"].includes(String(item.status || "").toLowerCase()));
  const urgent = [...items, ...requests].filter((item) => ["urgent", "high"].includes(String(item.severity || item.priority || "").toLowerCase()) && !["resolved", "published", "archived", "declined"].includes(String(item.status || "").toLowerCase()));
  const resolvedRequests = requests.filter((item) => ["resolved", "declined", "archived"].includes(String(item.status || "").toLowerCase()));
  const score = Math.max(0, Math.min(100, 45 + publicItems.length * 12 + resolvedRequests.length * 6 - openRequests.length * 5 - urgent.length * 12));

  return {
    items,
    requests,
    publicItems,
    openItems,
    openRequests,
    urgent,
    resolvedRequests,
    score,
  };
}
