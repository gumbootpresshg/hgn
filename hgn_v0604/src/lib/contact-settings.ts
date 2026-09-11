import "server-only";
import { createClient } from "@supabase/supabase-js";

export type ContactSettings = {
  singleton_key: string;
  contact_form_enabled: boolean;
  send_to_operations: boolean;
  contact_email: string | null;
  news_tips_email: string | null;
  advertising_email: string | null;
  subscriptions_email: string | null;
  public_notices_email: string | null;
  obituaries_email: string | null;
  corrections_email: string | null;
  letters_email: string | null;
  updated_at?: string | null;
};

export const DEFAULT_CONTACT_EMAIL = "sales@haidagwaiinews.com";

export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  singleton_key: "default",
  contact_form_enabled: true,
  send_to_operations: true,
  contact_email: DEFAULT_CONTACT_EMAIL,
  news_tips_email: DEFAULT_CONTACT_EMAIL,
  advertising_email: DEFAULT_CONTACT_EMAIL,
  subscriptions_email: DEFAULT_CONTACT_EMAIL,
  public_notices_email: DEFAULT_CONTACT_EMAIL,
  obituaries_email: DEFAULT_CONTACT_EMAIL,
  corrections_email: DEFAULT_CONTACT_EMAIL,
  letters_email: DEFAULT_CONTACT_EMAIL,
};

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function getContactSettings(): Promise<ContactSettings> {
  const db = serviceClient();
  if (!db) return DEFAULT_CONTACT_SETTINGS;

  const { data, error } = await db
    .from("hgn_contact_settings")
    .select("*")
    .eq("singleton_key", "default")
    .maybeSingle();

  if (error || !data) return DEFAULT_CONTACT_SETTINGS;
  return { ...DEFAULT_CONTACT_SETTINGS, ...data } as ContactSettings;
}

export function destinationForTopic(settings: ContactSettings, topic: string) {
  const lookup: Record<string, keyof ContactSettings> = {
    "News tip": "news_tips_email",
    Advertising: "advertising_email",
    Subscription: "subscriptions_email",
    "Public notice": "public_notices_email",
    Obituary: "obituaries_email",
    Correction: "corrections_email",
    "Letter to the editor": "letters_email",
  };
  const key = lookup[topic];
  const value = key ? settings[key] : settings.contact_email;
  return typeof value === "string" && value.trim() ? value.trim() : DEFAULT_CONTACT_EMAIL;
}
