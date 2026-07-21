"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { SectionHeader } from "@/components/SectionHeader";

const townCoords: Record<string, { lat: number; lng: number }> = {
  Masset: { lat: 54.0124, lng: -132.1497 },
  "Old Massett": { lat: 54.0372, lng: -132.1824 },
  "Port Clements": { lat: 53.6886, lng: -132.1853 },
  Tlell: { lat: 53.5652, lng: -131.9373 },
  Skidegate: { lat: 53.2669, lng: -132.0039 },
  "Daajing Giids": { lat: 53.2548, lng: -132.0829 },
  Sandspit: { lat: 53.242, lng: -131.8337 },
  "Island-wide": { lat: 53.62, lng: -132.08 },
};
const towns = Object.keys(townCoords);
const types = ["Events", "Garage Sales", "Alerts"];

export default function SubmitMapItem() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const area = String(form.get("area") || "Island-wide");
    const coords = townCoords[area] || townCoords["Island-wide"];
    const payload = {
      title: String(form.get("title") || ""),
      type: String(form.get("type") || "Events"),
      area,
      lat: coords.lat,
      lng: coords.lng,
      details: String(form.get("details") || ""),
      contact_name: String(form.get("contact_name") || ""),
      contact_email: String(form.get("contact_email") || ""),
      status: "pending",
    };
    const { error } = await supabase.from("live_map_items").insert(payload);
    if (error) return setError(error.message);
    setSent(true);
    e.currentTarget.reset();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <SectionHeader eyebrow="Editor approval" title="Submit a Live Map item" description="Send an event, garage sale or alert for HGN to review before it appears on the live map." />
      {sent && <div className="mb-5 rounded-2xl bg-green-50 p-4 font-bold text-green-800">Submitted. HGN can review it from the admin area.</div>}
      {error && <div className="mb-5 rounded-2xl bg-red-50 p-4 font-bold text-hgnBlue">{error}</div>}
      <form onSubmit={submit} className="hgn-card grid gap-4 p-6">
        <input name="title" required placeholder="Short title" className="rounded-xl border p-3" />
        <div className="grid gap-4 md:grid-cols-2">
          <select name="type" className="rounded-xl border p-3">{types.map(t => <option key={t}>{t}</option>)}</select>
          <select name="area" className="rounded-xl border p-3">{towns.map(t => <option key={t}>{t}</option>)}</select>
        </div>
        <textarea name="details" required placeholder="Details" rows={7} className="rounded-xl border p-3" />
        <div className="grid gap-4 md:grid-cols-2">
          <input name="contact_name" placeholder="Your name" className="rounded-xl border p-3" />
          <input name="contact_email" type="email" placeholder="Email" className="rounded-xl border p-3" />
        </div>
        <button className="rounded-xl bg-hgnBlue px-5 py-3 font-black text-white">Send to HGN</button>
      </form>
    </main>
  );
}
