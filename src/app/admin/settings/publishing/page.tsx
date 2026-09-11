"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const defaults = { newsroom_timezone: "America/Vancouver", date_style: "medium", time_style: "12h" };
const zones = [
  ["America/Vancouver", "Pacific - Vancouver / Haida Gwaii"],
  ["America/Edmonton", "Mountain - Edmonton"],
  ["America/Winnipeg", "Central - Winnipeg"],
  ["America/Toronto", "Eastern - Toronto"],
  ["America/Halifax", "Atlantic - Halifax"],
  ["America/St_Johns", "Newfoundland - St. John's"],
  ["UTC", "UTC"],
];

export default function PublishingSettingsPage() {
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function authHeaders(): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession();
    const headers: Record<string, string> = {};
    const token = data.session?.access_token;
    if (token) headers.authorization = `Bearer ${token}`;
    return headers;
  }

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/admin/publishing-settings", { headers: await authHeaders() });
      const result = await response.json();
      if (response.ok) setSettings({ ...defaults, ...(result.settings || {}) });
      else setError(result.error || "Could not load publishing settings.");
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true); setMessage(""); setError("");
    const response = await fetch("/api/admin/publishing-settings", { method: "PUT", headers: { ...(await authHeaders()), "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    const result = await response.json();
    if (response.ok) { setSettings({ ...defaults, ...(result.settings || settings) }); setMessage("Publishing date and time settings saved."); }
    else setError(result.error || "Could not save publishing settings.");
    setSaving(false);
  }

  if (loading) return <main className="mx-auto max-w-4xl px-4 py-10">Loading publishing settings...</main>;
  const sample = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: settings.date_style === "long" ? "long" : settings.date_style === "medium" ? "short" : "2-digit", day: "2-digit", timeZone: settings.newsroom_timezone }).format(new Date());

  return <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
    <section className="rounded-3xl border bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hgnBlue">Publisher settings</p>
      <h1 className="mt-3 font-serif text-5xl font-bold">Publishing dates & time</h1>
      <p className="mt-3 max-w-2xl text-slate-600">One newsroom clock for article editors, public pages, headline freshness, newsletters and future apps. Timestamps remain UTC in Supabase.</p>
    </section>
    <section className="grid gap-5 rounded-3xl border bg-white p-6 shadow-sm">
      <label className="font-bold">Newsroom timezone
        <select className="mt-2 w-full" value={settings.newsroom_timezone} onChange={(e) => setSettings((s) => ({ ...s, newsroom_timezone: e.target.value }))}>
          {zones.map(([value,label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="font-bold">Date style
          <select className="mt-2 w-full" value={settings.date_style} onChange={(e) => setSettings((s) => ({ ...s, date_style: e.target.value }))}>
            <option value="medium">Sep 10, 2026</option>
            <option value="long">September 10, 2026</option>
            <option value="iso">2026-09-10</option>
          </select>
        </label>
        <label className="font-bold">Time style
          <select className="mt-2 w-full" value={settings.time_style} onChange={(e) => setSettings((s) => ({ ...s, time_style: e.target.value }))}>
            <option value="12h">7:30 PM</option>
            <option value="24h">19:30</option>
          </select>
        </label>
      </div>
      <div className="rounded-2xl bg-slate-50 p-4 text-sm"><strong>Current preview:</strong> {sample}</div>
      {message && <p className="font-semibold text-green-700">{message}</p>}
      {error && <p className="font-semibold text-red-700">{error}</p>}
      <button onClick={save} disabled={saving} className="w-fit rounded-full bg-hgnNavy px-6 py-3 font-bold text-white disabled:opacity-50">{saving ? "Saving..." : "Save publishing settings"}</button>
    </section>
  </main>;
}
