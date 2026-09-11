"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Settings = {
  contact_form_enabled: boolean;
  send_to_operations: boolean;
  contact_email: string;
  news_tips_email: string;
  advertising_email: string;
  subscriptions_email: string;
  public_notices_email: string;
  obituaries_email: string;
  corrections_email: string;
  letters_email: string;
};

const emptySettings: Settings = {
  contact_form_enabled: true,
  send_to_operations: true,
  contact_email: "",
  news_tips_email: "",
  advertising_email: "",
  subscriptions_email: "",
  public_notices_email: "",
  obituaries_email: "",
  corrections_email: "",
  letters_email: "",
};

type EmailField = Exclude<keyof Settings, "contact_form_enabled" | "send_to_operations">;

const fields: Array<[EmailField, string, string]> = [
  ["contact_email", "General contact", "General questions and the email shown on the public Contact page."],
  ["news_tips_email", "News tips", "Messages submitted with the News tip topic."],
  ["advertising_email", "Advertising", "Advertising inquiries from the public contact form."],
  ["subscriptions_email", "Subscriptions", "Reader subscription questions."],
  ["public_notices_email", "Public notices", "Public notice inquiries."],
  ["obituaries_email", "Obituaries", "Obituary inquiries."],
  ["corrections_email", "Corrections", "Correction requests submitted through Contact."],
  ["letters_email", "Letters to the Editor", "Letter-related messages submitted through Contact."],
];

export default function ContactSettingsPage() {
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function token() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }

  async function load() {
    setLoading(true);
    setError("");
    const accessToken = await token();
    const response = await fetch("/api/admin/contact-settings", { headers: { authorization: `Bearer ${accessToken}` } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) setError(result.error || "Could not load contact settings.");
    else setSettings({ ...emptySettings, ...(result.settings || {}) });
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    setMessage("");
    setError("");
    const accessToken = await token();
    const response = await fetch("/api/admin/contact-settings", {
      method: "PUT",
      headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(settings),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) setError(result.error || "Could not save contact settings.");
    else {
      setSettings({ ...emptySettings, ...(result.settings || settings) });
      setMessage("Contact and notification settings saved.");
    }
    setSaving(false);
  }

  if (loading) return <main className="mx-auto max-w-5xl px-4 py-10">Loading contact settings...</main>;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-hgnBlue">Publisher settings</p>
        <h1 className="mt-3 font-serif text-5xl font-bold text-hgnNavy">Contact & Notifications</h1>
        <p className="mt-3 max-w-3xl text-slate-600">Choose where public contact messages are routed. Messages are always saved in HGN first; email and Operations are notification channels, not the only copy.</p>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          {fields.map(([key, label, help]) => (
            <label key={String(key)} className="grid gap-2 text-sm font-bold text-hgnNavy">
              {label}
              <input
                type="email"
                value={String(settings[key] || "")}
                onChange={(event) => setSettings((current) => ({ ...current, [key]: event.target.value }))}
                placeholder="name@haidagwaiinews.com"
                className="rounded-2xl border px-4 py-3 font-normal text-slate-900"
              />
              <span className="text-xs font-normal leading-5 text-slate-500">{help}</span>
            </label>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <label className="flex items-start gap-3 rounded-2xl border p-4">
            <input type="checkbox" checked={settings.contact_form_enabled} onChange={(event) => setSettings((current) => ({ ...current, contact_form_enabled: event.target.checked }))} className="mt-1" />
            <span><strong className="block">Public contact form enabled</strong><span className="text-sm text-slate-600">Turn off the web form temporarily without removing the Contact page.</span></span>
          </label>
          <label className="flex items-start gap-3 rounded-2xl border p-4">
            <input type="checkbox" checked={settings.send_to_operations} onChange={(event) => setSettings((current) => ({ ...current, send_to_operations: event.target.checked }))} className="mt-1" />
            <span><strong className="block">Send contact notice to HGN Operations</strong><span className="text-sm text-slate-600">The public message remains canonical even if Operations is unavailable.</span></span>
          </label>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          Replies are sent with Resend using the server-side sender configured by <code>HGN_ALERT_EMAIL_FROM</code>. Staff notification emails use the visitor's address as Reply-To, so replying from your normal mail client also works.
        </div>

        {message ? <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">{message}</p> : null}
        {error ? <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-900">{error}</p> : null}

        <button onClick={save} disabled={saving} className="mt-6 rounded-full bg-hgnNavy px-6 py-3 font-bold text-white disabled:opacity-50">{saving ? "Saving..." : "Save settings"}</button>
      </section>
    </main>
  );
}
