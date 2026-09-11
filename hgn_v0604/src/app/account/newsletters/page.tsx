"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const choices = [
  ["news", "Top local news"], ["breaking", "Breaking news"], ["events", "Community events"],
  ["weather_ferry", "Weather, marine and ferry"], ["sports", "Sports"], ["opinion", "Opinion"],
  ["obituaries", "Obituaries"], ["marketplace", "Marketplace"], ["guide", "Haida Gwaii Guide"],
];

async function accessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || "";
}

export default function AccountNewslettersPage() {
  const [subscriber, setSubscriber] = useState<any>(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [interests, setInterests] = useState<string[]>(["news", "events"]);
  const [frequency, setFrequency] = useState("biweekly");
  const [message, setMessage] = useState("Loading your newsletter settings…");
  const [busy, setBusy] = useState(false);

  async function load() {
    const token = await accessToken();
    if (!token) { setMessage("Please log in to manage newsletters."); return; }
    const response = await fetch("/api/newsletters/account", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || "Could not load newsletter settings."); return; }
    setSubscriber(data.subscriber);
    setAccountEmail(data.account_email || "");
    if (data.subscriber?.interests?.length) setInterests(data.subscriber.interests);
    if (data.subscriber?.frequency) setFrequency(data.subscriber.frequency);
    setMessage("");
  }

  useEffect(() => { load(); }, []);

  async function save(unsubscribe = false) {
    setBusy(true); setMessage("");
    try {
      const token = await accessToken();
      const response = await fetch("/api/newsletters/account", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ interests, frequency, unsubscribe }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save preferences.");
      setSubscriber(data.subscriber);
      setMessage(unsubscribe ? "You are unsubscribed." : "Newsletter preferences saved.");
    } catch (error: any) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  function toggle(value: string) {
    setInterests((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  return <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
    <section className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
      <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">My HGN</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight">My Newsletters</h1>
      <p className="mt-3 text-slate-600">Choose the HGN updates that belong in your inbox.</p>
      {message && <div className="mt-5 rounded-xl border bg-slate-50 p-4 font-bold">{message}</div>}
      <div className="mt-7 grid gap-5">
        <label>Email<input value={accountEmail} readOnly className="bg-slate-100" /></label>
        <label>Delivery<select value={frequency} onChange={(event) => setFrequency(event.target.value)}><option value="biweekly">Biweekly digest</option><option value="alerts">Major alerts only</option></select></label>
        <fieldset className="grid gap-3 rounded-2xl border p-5 sm:grid-cols-2"><legend className="px-2 font-black">What to include</legend>{choices.map(([value, label]) => <label key={value} className="flex items-center gap-3"><input className="w-auto" type="checkbox" checked={interests.includes(value)} onChange={() => toggle(value)} />{label}</label>)}</fieldset>
        <div className="flex flex-wrap gap-3"><button disabled={busy} onClick={() => save(false)} className="hgn-btn-primary">{subscriber?.status === "unsubscribed" ? "Resubscribe and save" : "Save preferences"}</button><button disabled={busy || subscriber?.status !== "active"} onClick={() => save(true)} className="rounded-xl border border-red-300 px-5 py-3 font-black text-red-700">Unsubscribe</button></div>
        {subscriber?.last_sent_at && <p className="text-sm text-slate-600">Last newsletter sent: {new Date(subscriber.last_sent_at).toLocaleString()}</p>}
      </div>
    </section>
  </main>;
}
