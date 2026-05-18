import { supabase } from "@/lib/supabase";

export type SourceDeskRow = Record<string, any>;

export function sourceDeskTone(status?: string | null, priority?: string | null) {
  const value = String(status || "").toLowerCase();
  const level = String(priority || "").toLowerCase();
  if (["verified", "active", "published", "complete", "ready"].includes(value)) return "good";
  if (["blocked", "stale", "needs_review", "unverified"].includes(value) || ["urgent", "high"].includes(level)) return "bad";
  if (["new", "pending", "contacted", "draft", "scheduled", "in_progress"].includes(value)) return "warn";
  return "neutral";
}

export function sourceDeskToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

async function readTable(table: string, order = "created_at") {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending: false }).limit(100);
  if (error) return [] as SourceDeskRow[];
  return (data || []) as SourceDeskRow[];
}

export async function getSourceDeskSnapshot() {
  const [contacts, pitches, followups, checks] = await Promise.all([
    readTable("source_contacts", "created_at"),
    readTable("source_story_pitches", "created_at"),
    readTable("source_followups", "created_at"),
    readTable("source_verification_checks", "created_at"),
  ]);

  const activeSources = contacts.filter((item) => ["active", "verified"].includes(String(item.status || "").toLowerCase())).length;
  const urgentPitches = pitches.filter((item) => ["urgent", "high"].includes(String(item.priority || "").toLowerCase()) || ["needs_review", "new"].includes(String(item.status || "").toLowerCase())).length;
  const openFollowups = followups.filter((item) => !["done", "complete"].includes(String(item.status || "").toLowerCase())).length;
  const unverifiedChecks = checks.filter((item) => !["verified", "complete", "ready"].includes(String(item.status || "").toLowerCase())).length;

  const score = Math.max(0, Math.min(100,
    Math.min(35, activeSources * 7) +
    Math.min(25, pitches.filter((item) => ["assigned", "ready", "published"].includes(String(item.status || "").toLowerCase())).length * 6) +
    Math.min(20, followups.filter((item) => ["done", "complete"].includes(String(item.status || "").toLowerCase())).length * 5) +
    Math.min(20, checks.filter((item) => ["verified", "complete"].includes(String(item.status || "").toLowerCase())).length * 5) -
    Math.min(30, urgentPitches * 5 + unverifiedChecks * 3)
  ));

  return { score, contacts, pitches, followups, checks, activeSources, urgentPitches, openFollowups, unverifiedChecks };
}
