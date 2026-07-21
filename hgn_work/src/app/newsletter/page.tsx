"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const interests = ["Daily headlines", "Breaking news", "Events", "Classifieds", "Weather/ferry alerts", "Supporter updates"];

export default function NewsletterPage() {
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const selected = interests.filter((i) => form.get(i) === "on");

    const payload = {
      email: String(form.get("email") || "").trim().toLowerCase(),
      name: String(form.get("name") || "").trim(),
      town: String(form.get("town") || "").trim(),
      source: "newsletter_page",
      interests: selected,
      status: "active",
    };

    const { error } = await supabase.from("subscribers").upsert(payload, { onConflict: "email" });
    if (error) alert(error.message);
    else {
      setOk(true);
      e.currentTarget.reset();
    }
    setSaving(false);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-3xl bg-hgnNavy p-8 text-white shadow-sm md:p-10">
        <p className="text-sm font-black uppercase tracking-widest text-sky-200">HGN Email</p>
        <h1 className="mt-2 text-5xl font-black">Get the island update</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-100">
          Sign up for Haida Gwaii News updates: headlines, events, classifieds, alerts and ways to support keeping local journalism available to everyone.
        </p>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <form onSubmit={submit} className="hgn-card grid gap-4 p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Subscribe</h2>
          {ok && <div className="rounded-xl bg-green-50 p-4 font-bold text-green-800">You are signed up. Thank you for supporting local news.</div>}
          <label>Name<input name="name" /></label>
          <label>Email<input name="email" type="email" required /></label>
          <label>Town / community<input name="town" placeholder="Masset, Skidegate, Daajing Giids..." /></label>
          <fieldset className="grid gap-2 rounded-2xl border p-4">
            <legend className="px-2 font-black text-hgnNavy">What should we send?</legend>
            {interests.map((interest) => (
              <label key={interest} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input className="w-auto" type="checkbox" name={interest} defaultChecked={interest === "Daily headlines" || interest === "Events"} />
                {interest}
              </label>
            ))}
          </fieldset>
          <button disabled={saving} className="hgn-btn-primary">{saving ? "Saving..." : "Sign up"}</button>
        </form>

        <aside className="space-y-4">
          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">Why it matters</h2>
            <p className="mt-3 text-slate-700">A strong newsletter helps HGN reach readers directly, promote events, support advertisers and keep the website and paper free to read.</p>
          </div>
          <div className="hgn-card p-6">
            <h2 className="text-2xl font-black text-hgnNavy">For advertisers</h2>
            <p className="mt-3 text-slate-700">A larger opt-in audience makes digital sponsorships, events roundups and classifieds emails more valuable.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
