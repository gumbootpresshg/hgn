import { supabase } from "@/lib/supabase";

export type EmergencyDeskRow = Record<string, any>;

export function emergencyTone(status?: string | null, severity?: string | null) {
  const s = String(status || "").toLowerCase();
  const sev = String(severity || "").toLowerCase();
  if (["published", "active", "verified", "complete", "done"].includes(s)) return "good";
  if (["alert", "critical", "warning"].includes(sev) || ["blocked", "needs_verification"].includes(s)) return "bad";
  if (["draft", "watch", "todo", "review", "pending"].includes(s) || ["watch", "advisory"].includes(sev)) return "warn";
  return "neutral";
}

export function emergencyToneClasses(tone: string) {
  if (tone === "good") return "border-green-200 bg-green-50 text-green-900";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "bad") return "border-red-200 bg-red-50 text-red-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

async function readTable(table: string, order = "created_at") {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending: false }).limit(100);
  if (error) return [] as EmergencyDeskRow[];
  return (data || []) as EmergencyDeskRow[];
}

export async function getEmergencyDeskSnapshot() {
  const [updates, contacts, checklist] = await Promise.all([
    readTable("emergency_updates", "created_at"),
    readTable("emergency_contacts", "created_at"),
    readTable("emergency_checklist_items", "created_at"),
  ]);

  const now = Date.now();
  const activeUpdates = updates.filter((item) => ["published", "active"].includes(String(item.status || "").toLowerCase()) && (!item.expires_at || new Date(item.expires_at).getTime() > now)).length;
  const urgentUpdates = updates.filter((item) => ["warning", "alert", "critical"].includes(String(item.severity || "").toLowerCase()) && !["expired", "resolved"].includes(String(item.status || "").toLowerCase())).length;
  const verifiedContacts = contacts.filter((item) => ["active", "verified"].includes(String(item.status || "").toLowerCase())).length;
  const openChecklist = checklist.filter((item) => !["done", "complete"].includes(String(item.status || "").toLowerCase())).length;
  const completedChecklist = checklist.length - openChecklist;

  const score = Math.max(0, Math.min(100,
    Math.min(30, verifiedContacts * 8) +
    Math.min(30, completedChecklist * 10) +
    Math.min(20, updates.filter((item) => ["draft", "review", "published", "active"].includes(String(item.status || "").toLowerCase())).length * 5) +
    Math.min(20, updates.filter((item) => item.official_source || item.official_url || item.verified_by).length * 5) -
    Math.min(35, urgentUpdates * 8 + updates.filter((item) => String(item.status || "").toLowerCase() === "needs_verification").length * 8)
  ));

  return { score, updates, contacts, checklist, activeUpdates, urgentUpdates, verifiedContacts, openChecklist };
}

export async function getPublicEmergencyUpdates() {
  const { data, error } = await supabase
    .from("emergency_updates")
    .select("*")
    .in("status", ["published", "active"])
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(25);
  if (error) return [] as EmergencyDeskRow[];
  const now = Date.now();
  return ((data || []) as EmergencyDeskRow[]).filter((item) => !item.expires_at || new Date(item.expires_at).getTime() > now);
}
