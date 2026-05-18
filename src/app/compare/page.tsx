"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Player = {
  id: string;
  slug: string;
  name: string;
  rank: number | null;
  avg_rank: number | null;
  high_rank: number | null;
  low_rank: number | null;
  trend: number | null;
  team: string | null;
  league: string | null;
  position: string | null;
  height: string | null;
  weight: string | null;
  shoots: string | null;
  stats: string | null;
};

function trendText(trend: number | null) {
  if (!trend) return "—";
  if (trend > 0) return `↑ ${trend}`;
  return `↓ ${Math.abs(trend)}`;
}

export default function ComparePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadPlayers() {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("rank", { ascending: true, nullsFirst: false });

      if (error) {
        console.error("Could not load players:", error.message);
        setPlayers([]);
        return;
      }

      setPlayers((data || []) as Player[]);
    }

    loadPlayers();
  }, []);

  const selectedPlayers = selectedIds
    .map((id) => players.find((player) => player.id === id))
    .filter(Boolean) as Player[];

  const filteredPlayers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return [];

    return players
      .filter((player) => {
        if (selectedIds.includes(player.id)) return false;

        return (
          player.name.toLowerCase().includes(query) ||
          (player.team || "").toLowerCase().includes(query) ||
          (player.league || "").toLowerCase().includes(query) ||
          (player.position || "").toLowerCase().includes(query)
        );
      })
      .slice(0, 20);
  }, [players, search, selectedIds]);

  function addPlayer(playerId: string) {
    if (selectedIds.length >= 4) return;

    setSelectedIds((current) => [...current, playerId]);
    setSearch("");
  }

  function removePlayer(playerId: string) {
    setSelectedIds((current) => current.filter((id) => id !== playerId));
  }

  const rows: {
    label: string;
    getValue: (player: Player) => string | number;
  }[] = [
    {
      label: "Consensus Rank",
      getValue: (player) => (player.rank ? `#${player.rank}` : "—"),
    },
    {
      label: "Average Rank",
      getValue: (player) => player.avg_rank ?? "—",
    },
    {
      label: "High / Low",
      getValue: (player) =>
        `${player.high_rank ?? "—"} / ${player.low_rank ?? "—"}`,
    },
    {
      label: "Trend",
      getValue: (player) => trendText(player.trend),
    },
    {
      label: "Position",
      getValue: (player) => player.position || "—",
    },
    {
      label: "Team",
      getValue: (player) => player.team || "—",
    },
    {
      label: "League",
      getValue: (player) => player.league || "—",
    },
    {
      label: "Height",
      getValue: (player) => player.height || "—",
    },
    {
      label: "Weight",
      getValue: (player) => player.weight || "—",
    },
    {
      label: "Shoots",
      getValue: (player) => player.shoots || "—",
    },
    {
      label: "Profile Status",
      getValue: (player) => player.stats || "Stats pending",
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 px-8 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="text-zinc-400 hover:text-white">
          ← Back to rankings
        </Link>

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-sm uppercase tracking-widest text-zinc-500">
            PuckScope
          </p>

          <h1 className="mt-3 text-5xl font-bold">Compare Prospects</h1>

          <p className="mt-3 text-zinc-400">
            Select 2–4 prospects and compare rankings, bio details, movement,
            and profile status side by side.
          </p>

          <div className="relative mt-6">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search players to compare..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-4 outline-none"
            />

            {search && filteredPlayers.length > 0 && (
              <div className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
                {filteredPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => addPlayer(player.id)}
                    disabled={selectedIds.length >= 4}
                    className="block w-full px-5 py-3 text-left hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="font-semibold">{player.name}</span>
                    <span className="ml-2 text-sm text-zinc-500">
                      {player.position || "—"} • {player.team || "—"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {selectedPlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => removePlayer(player.id)}
                className="rounded-full bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700"
              >
                {player.name} ✕
              </button>
            ))}

            {selectedPlayers.length === 0 && (
              <p className="text-sm text-zinc-500">
                No prospects selected yet.
              </p>
            )}
          </div>
        </section>

        {selectedPlayers.length > 0 && (
          <section className="mt-6 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="w-56 px-5 py-4 text-zinc-400">Category</th>

                  {selectedPlayers.map((player) => (
                    <th key={player.id} className="px-5 py-4">
                      <Link
                        href={`/player/${player.slug}`}
                        className="text-xl font-bold hover:underline"
                      >
                        {player.name}
                      </Link>

                      <p className="mt-1 text-sm text-zinc-500">
                        {player.position || "—"} • {player.team || "—"}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t border-zinc-800">
                    <td className="px-5 py-4 font-semibold text-zinc-400">
                      {row.label}
                    </td>

                    {selectedPlayers.map((player) => (
                      <td key={player.id} className="px-5 py-4">
                        {row.getValue(player)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </main>
  );
}