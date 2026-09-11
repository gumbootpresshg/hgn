import "server-only";
import { createClient } from "@supabase/supabase-js";

export type DateStyle = "long" | "medium" | "iso";
export type TimeStyle = "12h" | "24h";

export type PublishingSettings = {
  singleton_key: string;
  newsroom_timezone: string;
  date_style: DateStyle;
  time_style: TimeStyle;
  updated_at?: string | null;
};

export const DEFAULT_PUBLISHING_SETTINGS: PublishingSettings = {
  singleton_key: "default",
  newsroom_timezone: "America/Vancouver",
  date_style: "medium",
  time_style: "12h",
};

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function getPublishingSettings(): Promise<PublishingSettings> {
  const db = serviceClient();
  if (!db) return DEFAULT_PUBLISHING_SETTINGS;
  const { data, error } = await db.from("hgn_publishing_settings").select("*").eq("singleton_key", "default").maybeSingle();
  if (error || !data) return DEFAULT_PUBLISHING_SETTINGS;
  return { ...DEFAULT_PUBLISHING_SETTINGS, ...data } as PublishingSettings;
}

export function dateFormatOptions(settings: PublishingSettings): Intl.DateTimeFormatOptions {
  if (settings.date_style === "long") return { year: "numeric", month: "long", day: "numeric", timeZone: settings.newsroom_timezone };
  if (settings.date_style === "iso") return { year: "numeric", month: "2-digit", day: "2-digit", timeZone: settings.newsroom_timezone };
  return { year: "numeric", month: "short", day: "numeric", timeZone: settings.newsroom_timezone };
}

export function formatPublishingDate(value: string | Date | null | undefined, settings: PublishingSettings) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  if (settings.date_style === "iso") {
    const parts = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: settings.newsroom_timezone }).formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
    return `${get("year")}-${get("month")}-${get("day")}`;
  }
  return date.toLocaleDateString("en-CA", dateFormatOptions(settings));
}

export function formatPublishingTime(value: string | Date | null | undefined, settings: PublishingSettings) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: settings.time_style === "12h",
    timeZone: settings.newsroom_timezone,
  });
}

export function formatFreshness(value: string | null | undefined, settings: PublishingSettings) {
  if (!value) return "";
  const date = new Date(value);
  const publishedMs = date.getTime();
  if (!Number.isFinite(publishedMs)) return "";
  const ageMs = Date.now() - publishedMs;
  if (ageMs < 0) return formatPublishingDate(value, settings);
  const minutes = Math.floor(ageMs / 60000);
  if (minutes < 60) return minutes <= 1 ? "<1h" : `${minutes}m`;
  const hours = Math.floor(ageMs / 3600000);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(ageMs / 86400000);
  if (days < 7) return `${days}d`;
  return formatPublishingDate(value, settings);
}
