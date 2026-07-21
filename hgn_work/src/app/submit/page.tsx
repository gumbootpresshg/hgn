"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SubmitProfilePage() {
  const [status, setStatus] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Submitting for review...");

    const formElement = event.target as HTMLFormElement;
    const form = new FormData(formElement);

    const { error } = await supabase.from("prospect_submissions").insert({
      player_name: form.get("player_name"),
      birth_year: form.get("birth_year"),
      position: form.get("position"),
      shoots: form.get("shoots"),
      height: form.get("height"),
      weight: form.get("weight"),
      team: form.get("team"),
      league: form.get("league"),
      nhl_team: form.get("nhl_team"),
      draft_year: form.get("draft_year"),
      video_url: form.get("video_url"),
      highlights_url: form.get("highlights_url"),
      measurable_data: form.get("measurable_data"),
      achievements: form.get("achievements"),
      contact_email: form.get("contact_email"),
      notes: form.get("notes"),
      verification_status: "pending",
    });

    if (error) {
      console.error(error);
      setStatus("Something went wrong. Please try again.");
      return;
    }

    formElement.reset();
    setStatus("Submitted! This profile will stay pending until it is reviewed and approved.");
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-8 py-10 text-white">
      <Link href="/" className="text-zinc-400 hover:text-white">
        ← Back to rankings
      </Link>

      <section className="mx-auto mt-8 max-w-4xl">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm uppercase tracking-widest text-blue-300">
            Submit / Claim Player Profile
          </p>

          <h1 className="mt-3 text-5xl font-bold">Submit or Claim a Prospect Profile</h1>

          <p className="mt-3 text-zinc-400">
            Players, parents, coaches, advisors, and lesser-known prospects can submit or claim a player profile with info, stats, highlights, measurements, achievements, and contact details. Nothing goes public until it is reviewed and approved.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input name="player_name" required className="rounded-xl bg-zinc-800 px-4 py-3 outline-none" placeholder="Player name" />
            <input name="birth_year" className="rounded-xl bg-zinc-800 px-4 py-3 outline-none" placeholder="Birth year" />
            <input name="position" className="rounded-xl bg-zinc-800 px-4 py-3 outline-none" placeholder="Position: C, LW, RD, G..." />
            <input name="shoots" className="rounded-xl bg-zinc-800 px-4 py-3 outline-none" placeholder="Shoots / catches" />
            <input name="height" className="rounded-xl bg-zinc-800 px-4 py-3 outline-none" placeholder="Height" />
            <input name="weight" className="rounded-xl bg-zinc-800 px-4 py-3 outline-none" placeholder="Weight" />
            <input name="team" className="rounded-xl bg-zinc-800 px-4 py-3 outline-none" placeholder="Current team" />
            <input name="league" className="rounded-xl bg-zinc-800 px-4 py-3 outline-none" placeholder="League: WHL, OHL, BCHL, NCAA..." />
            <input name="draft_year" className="rounded-xl bg-zinc-800 px-4 py-3 outline-none" placeholder="Draft year: 2026, 2027, 2028..." />
            <input name="nhl_team" className="rounded-xl bg-zinc-800 px-4 py-3 outline-none" placeholder="NHL team, if drafted" />
            <input name="video_url" className="rounded-xl bg-zinc-800 px-4 py-3 outline-none" placeholder="Main video URL" />
            <input name="highlights_url" className="rounded-xl bg-zinc-800 px-4 py-3 outline-none" placeholder="Highlights / Hudl / YouTube URL" />
            <input name="contact_email" type="email" className="rounded-xl bg-zinc-800 px-4 py-3 outline-none md:col-span-2" placeholder="Contact email" />
          </div>

          <textarea name="measurable_data" className="min-h-28 w-full rounded-xl bg-zinc-800 px-4 py-3 outline-none" placeholder="Measurable data: height/weight updates, testing, skating times, shot speed, save percentage, etc." />
          <textarea name="achievements" className="min-h-28 w-full rounded-xl bg-zinc-800 px-4 py-3 outline-none" placeholder="Achievements: awards, tournament teams, captaincy, championships, point totals..." />
          <textarea name="notes" className="min-h-32 w-full rounded-xl bg-zinc-800 px-4 py-3 outline-none" placeholder="Anything else we should know before reviewing this profile?" />

          <button type="submit" className="w-full rounded-xl bg-white px-5 py-4 font-semibold text-black">
            Submit for Review
          </button>

          {status && <p className="text-sm text-zinc-400">{status}</p>}
        </form>
      </section>
    </main>
  );
}
