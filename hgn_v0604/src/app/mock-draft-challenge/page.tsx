"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PickRow = {
  slot: number;
  player: string;
};

type Entry = {
  id: string;
  display_name: string;
  email: string | null;
  tiebreaker: string | null;
  picks: PickRow[] | null;
  score: number | null;
  perfect_picks: number | null;
  created_at: string | null;
};

const defaultProspects = [
  "Gavin McKenna",
  "Keaton Verhoeff",
  "Ivar Stenberg",
  "Ryan Roobroeck",
  "Ethan Belchetz",
  "Lukas Dragicevic",
  "Ryder Ritchie",
  "Cole Reschny",
  "Matthew Schaefer",
  "Porter Martone",
  "James Hagens",
  "Michael Misa",
  "Anton Frondell",
  "Roger McQueen",
  "Caleb Desnoyers",
  "Jake O'Brien",
  "Malcolm Spence",
  "Brady Martin",
  "Victor Eklund",
  "Carter Bear",
  "Jackson Smith",
  "William Moore",
  "Logan Hensler",
  "Radim Mrtka",
  "Blake Fiddler",
  "Sascha Boumedienne",
  "Cameron Schmidt",
  "Brandon Gorzynski",
  "Ben Kindel",
  "Justin Carbonneau",
  "Joshua Ravensbergen",
  "Jack Ivankovic",
];

const starterPicks: PickRow[] = Array.from({ length: 32 }, (_, index) => ({
  slot: index + 1,
  player: defaultProspects[index] || "",
}));

function emptyPicks() {
  return Array.from({ length: 32 }, (_, index) => ({ slot: index + 1, player: "" }));
}

export default function MockDraftChallengePage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [tiebreaker, setTiebreaker] = useState("");
  const [picks, setPicks] = useState<PickRow[]>(starterPicks);
  const [leaderboard, setLeaderboard] = useState<Entry[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("puckscope_mock_draft_challenge");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { displayName?: string; email?: string; tiebreaker?: string; picks?: PickRow[] };
        if (parsed.displayName) setDisplayName(parsed.displayName);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.tiebreaker) setTiebreaker(parsed.tiebreaker);
        if (Array.isArray(parsed.picks) && parsed.picks.length === 32) setPicks(parsed.picks);
      } catch {
        // ignore broken local data
      }
    }
    loadLeaderboard();
  }, []);

  const completedCount = useMemo(() => picks.filter((pick) => pick.player.trim()).length, [picks]);
  const draftDate = new Date("2026-06-26T16:00:00-07:00");
  const daysToDraft = Math.max(0, Math.ceil((draftDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  async function loadLeaderboard() {
    const { data, error } = await supabase
      .from("mock_draft_challenge_entries")
      .select("id, display_name, email, tiebreaker, picks, score, perfect_picks, created_at")
      .order("score", { ascending: false, nullsFirst: false })
      .order("perfect_picks", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: true })
      .limit(20);

    if (!error) setLeaderboard((data || []) as Entry[]);
  }

  function updatePick(slot: number, player: string) {
    setPicks((current) => current.map((pick) => (pick.slot === slot ? { ...pick, player } : pick)));
  }

  function saveLocal() {
    window.localStorage.setItem(
      "puckscope_mock_draft_challenge",
      JSON.stringify({ displayName, email, tiebreaker, picks })
    );
    setMessage("Saved in this browser.");
  }

  async function submitEntry() {
    setMessage("");
    if (!displayName.trim()) {
      setMessage("Add a display name before submitting.");
      return;
    }
    if (completedCount < 32) {
      setMessage("Fill all 32 picks before submitting your challenge entry.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("mock_draft_challenge_entries").insert({
      display_name: displayName.trim(),
      email: email.trim() || null,
      tiebreaker: tiebreaker.trim() || null,
      picks,
      contest_year: 2026,
      status: "submitted",
    });
    setSaving(false);

    if (error) {
      setMessage(`Could not submit yet: ${error.message}`);
      return;
    }

    saveLocal();
    setMessage("Entry submitted. Good luck on draft night.");
    loadLeaderboard();
  }

  async function copyEntry() {
    const text = [
      "PuckScope Mock Draft Challenge — Top 32",
      `Name: ${displayName || "Anonymous"}`,
      ...picks.map((pick) => `${pick.slot}. ${pick.player || "—"}`),
      tiebreaker ? `Tiebreaker: ${tiebreaker}` : "",
    ].filter(Boolean).join("\n");
    await navigator.clipboard.writeText(text);
    setMessage("Copied your Top 32 entry.");
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <Link href="/draft-room" className="text-sm text-zinc-400 hover:text-white">← Back to Draft Room</Link>

        <section className="mt-8 rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/15 via-zinc-900 to-black p-8">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-300">PuckScope Contest</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="text-5xl font-black tracking-tight">Mock Draft Challenge</h1>
              <p className="mt-4 max-w-3xl text-zinc-300">
                Guess the first 32 picks before the 2026 NHL Draft in Buffalo. Save a browser copy, submit your entry, and come back for leaderboard scoring after draft night.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">Draft countdown</p>
              <p className="mt-2 text-4xl font-black text-blue-200">{daysToDraft} days</p>
              <p className="mt-2 text-sm text-zinc-400">Target: June 26, 2026. Final rules/prize details can be updated by PuckScope before entries lock.</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm text-zinc-300">
                Display name
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Vince B." className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-400" />
              </label>
              <label className="grid gap-2 text-sm text-zinc-300">
                Email optional
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="for prize contact" className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-400" />
              </label>
              <label className="grid gap-2 text-sm text-zinc-300">
                Tiebreaker
                <input value={tiebreaker} onChange={(e) => setTiebreaker(e.target.value)} placeholder="First trade? First goalie?" className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-400" />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">Your Top 32</h2>
                <p className="mt-1 text-sm text-zinc-400">{completedCount}/32 picks filled. Starter names are placeholders — edit freely.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setPicks(starterPicks)} className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-200 hover:border-blue-300">Starter list</button>
                <button onClick={() => setPicks(emptyPicks())} className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-200 hover:border-red-300">Clear</button>
                <button onClick={saveLocal} className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-200 hover:border-blue-300">Save local</button>
                <button onClick={copyEntry} className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-200 hover:border-blue-300">Copy</button>
                <button onClick={() => window.print()} className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-200 hover:border-blue-300">Print/PDF</button>
              </div>
            </div>

            <div className="mt-5 grid gap-2 md:grid-cols-2">
              {picks.map((pick) => (
                <label key={pick.slot} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-950 p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-sm font-black text-blue-200">{pick.slot}</span>
                  <input value={pick.player} onChange={(e) => updatePick(pick.slot, e.target.value)} placeholder={`Pick ${pick.slot}`} className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600" />
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button disabled={saving} onClick={submitEntry} className="rounded-full bg-white px-6 py-3 font-black text-zinc-950 hover:bg-blue-100 disabled:opacity-60">
                {saving ? "Submitting..." : "Submit Challenge Entry"}
              </button>
              {message && <p className="text-sm text-blue-200">{message}</p>}
            </div>
          </div>

          <aside className="grid gap-6 content-start">
            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-2xl font-black">Contest idea</h2>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-300">
                <p>Score 1 point per exact player-to-pick match, bonus points for correct team/player combinations once the final draft order is known.</p>
                <p>Prize language can stay flexible until sponsors or merch are ready.</p>
                <p className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 text-blue-100">Suggested prize: PuckScope merch, free premium access, or sponsor-backed draft-night package.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-2xl font-black">Leaderboard</h2>
              <div className="mt-4 grid gap-3">
                {leaderboard.length === 0 && <p className="text-sm text-zinc-500">No public entries yet. Submit the first one.</p>}
                {leaderboard.map((entry, index) => (
                  <div key={entry.id} className="rounded-2xl border border-white/10 bg-zinc-950 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black">#{index + 1} {entry.display_name}</p>
                      <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-black text-blue-200">{entry.score ?? 0} pts</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">Perfect picks: {entry.perfect_picks ?? 0} • {entry.created_at?.split("T")[0] || "Submitted"}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
