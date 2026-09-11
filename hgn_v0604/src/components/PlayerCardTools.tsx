"use client";

import { useEffect, useMemo, useState } from "react";

type ToolPlayer = {
  id: string;
  slug: string;
  name: string;
  position: string | null;
  team: string | null;
  league: string | null;
  rank: number | null;
};

type SavedNote = {
  role: string;
  note: string;
  updatedAt: string;
};

export default function PlayerCardTools({ player }: { player: ToolPlayer }) {
  const storageKey = `prospect-player-card:${player.slug}`;
  const boardKey = "gm-draft-board-quick-adds";
  const trackerKey = "gm-my-prospects-quick-adds";

  const [role, setRole] = useState("Watchlist");
  const [note, setNote] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as SavedNote;
      setRole(parsed.role || "Watchlist");
      setNote(parsed.note || "");
      setSavedAt(parsed.updatedAt || null);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const reportText = useMemo(() => {
    return [
      `${player.name} scouting card`,
      `Position: ${player.position || "-"}`,
      `Team: ${player.team || "-"}`,
      `League: ${player.league || "-"}`,
      `Rank: ${player.rank ? `#${player.rank}` : "-"}`,
      `Status: ${role}`,
      "",
      "Private note:",
      note || "-",
    ].join("\n");
  }, [note, player, role]);

  function saveNote() {
    const updatedAt = new Date().toLocaleString();
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ role, note, updatedAt } satisfies SavedNote)
    );
    setSavedAt(updatedAt);
  }

  function appendToLocalList(key: string) {
    const existing = window.localStorage.getItem(key);
    const parsed = existing ? JSON.parse(existing) : [];
    const list = Array.isArray(parsed) ? parsed : [];
    const withoutDuplicate = list.filter((item: { slug?: string }) => item.slug !== player.slug);

    withoutDuplicate.unshift({
      slug: player.slug,
      name: player.name,
      position: player.position,
      team: player.team,
      league: player.league,
      rank: player.rank,
      note,
      status: role,
      addedAt: new Date().toISOString(),
    });

    window.localStorage.setItem(key, JSON.stringify(withoutDuplicate));
    saveNote();
  }

  async function copyReport() {
    await navigator.clipboard.writeText(reportText);
    saveNote();
  }

  function emailReport() {
    saveNote();
    const subject = encodeURIComponent(`${player.name} scouting card`);
    const body = encodeURIComponent(reportText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <section className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-sky-300">GM Tools</p>
          <h2 className="mt-2 text-2xl font-bold">Private Scouting Card</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Save notes in this browser, add the player to your GM lists, or create a quick report.
          </p>
        </div>

        {savedAt && <p className="text-xs text-zinc-500">Saved {savedAt}</p>}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr]">
        <label className="block">
          <span className="text-sm text-zinc-400">Status</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-white"
          >
            <option>Watchlist</option>
            <option>Draft Target</option>
            <option>Fantasy Target</option>
            <option>Sleeper</option>
            <option>Avoid</option>
            <option>Needs more viewings</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-zinc-400">Private note</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={5}
            placeholder="Example: Explosive first three steps, needs more tracking below the dots, worth watching vs stronger competition."
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-white placeholder:text-zinc-600"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={saveNote} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950">
          Save Note
        </button>
        <button onClick={() => appendToLocalList(boardKey)} className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold hover:bg-zinc-700">
          Add to Draft Board
        </button>
        <button onClick={() => appendToLocalList(trackerKey)} className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold hover:bg-zinc-700">
          Add to My Prospects
        </button>
        <button onClick={copyReport} className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold hover:bg-zinc-700">
          Copy Report
        </button>
        <button onClick={() => window.print()} className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold hover:bg-zinc-700">
          Print/PDF
        </button>
        <button onClick={emailReport} className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold hover:bg-zinc-700">
          Email Report
        </button>
      </div>
    </section>
  );
}
