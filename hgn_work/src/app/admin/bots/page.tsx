"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminGate, useAdminSession } from "@/components/AdminGate";
import { supabase } from "@/lib/supabase";
import { BotRun, freshnessLabel, liveHealthFromRuns, movementLabel, movementTone } from "@/lib/liveEngine";

type PlayerTrend = {
  id: string;
  slug: string | null;
  name: string;
  position: string | null;
  team: string | null;
  league: string | null;
  rank: number | null;
  trend: number | null;
  tag: string | null;
  updated_at?: string | null;
};

type RankingMovementRow = {
  id?: string;
  player_name?: string | null;
  category?: string | null;
  previous_rank?: number | null;
  current_rank?: number | null;
  movement?: number | null;
  snapshot_date?: string | null;
  created_at?: string | null;
};

const botButtons = [
  { label: "Run Rankings Bot", href: "/api/run-rankings-bot", description: "Refresh ranking source data and consensus board inputs." },
];

export default function AdminBotsPage() {
  const { isAuthed } = useAdminSession();
  const [runs, setRuns] = useState<BotRun[]>([]);
  const [trending, setTrending] = useState<PlayerTrend[]>([]);
  const [movement, setMovement] = useState<RankingMovementRow[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const health = useMemo(() => liveHealthFromRuns(runs), [runs]);
  const latestRun = useMemo(() => {
    return [...runs].sort((a, b) => new Date(b.finished_at || b.created_at || b.started_at || 0).getTime() - new Date(a.finished_at || a.created_at || a.started_at || 0).getTime())[0];
  }, [runs]);

  async function loadLiveEngine() {
    setLoading(true);
    setStatusMessage("");

    const [{ data: botRuns, error: botRunsError }, { data: players }, { data: movements, error: movementError }] = await Promise.all([
      supabase.from("bot_runs").select("*").order("created_at", { ascending: false }).limit(12),
      supabase.from("players").select("id, slug, name, position, team, league, rank, trend, tag, updated_at").order("trend", { ascending: false, nullsFirst: false }).limit(12),
      supabase.from("ranking_movements").select("*").order("created_at", { ascending: false }).limit(12),
    ]);

    if (botRunsError) {
      setRuns([]);
      setStatusMessage("Run supabase/puckscope_live_engine.sql if bot history does not load yet.");
    } else {
      setRuns((botRuns || []) as BotRun[]);
    }

    setMovement(movementError ? [] : ((movements || []) as RankingMovementRow[]));
    setTrending((players || []) as PlayerTrend[]);
    setLoading(false);
  }

  async function runBot(href: string) {
    setStatusMessage("Starting bot endpoint...");
    try {
      const res = await fetch(href);
      const text = await res.text();
      setStatusMessage(text.slice(0, 500) || "Bot endpoint finished.");
      await loadLiveEngine();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not run bot endpoint.");
    }
  }

  useEffect(() => {
    if (isAuthed) loadLiveEngine();
  }, [isAuthed]);

  if (!isAuthed) return (
    <AdminGate title="Bot Dashboard" eyebrow="PuckScope Live Engine" description="Refresh news, rankings, trending prospects, and live-player-card movement." />
  );

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm text-zinc-400 hover:text-white">← Back to Admin</Link>
            <p className="mt-8 text-sm uppercase tracking-[0.35em] text-blue-300">PuckScope Live Engine</p>
            <h1 className="mt-3 text-5xl font-black tracking-tight">Freshness Control Room</h1>
            <p className="mt-4 max-w-2xl text-zinc-400">Monitor rankings/news refreshes, ranking movement, trending prospects, and homepage ticker inputs.</p>
          </div>
          <button onClick={loadLiveEngine} className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 hover:bg-white hover:text-black">Refresh Dashboard</button>
        </div>

        <section className="mt-10 grid gap-5 lg:grid-cols-4">
          <div className={`rounded-3xl border p-6 ${health.tone}`}>
            <p className="text-xs font-bold uppercase tracking-[0.25em] opacity-80">Live Health</p>
            <h2 className="mt-4 text-3xl font-black">{health.label}</h2>
            <p className="mt-2 text-sm opacity-80">{latestRun ? `${latestRun.bot_name} • ${freshnessLabel(latestRun.finished_at || latestRun.created_at)}` : "No bot runs recorded yet."}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-300">Tracked Runs</p>
            <h2 className="mt-4 text-3xl font-black">{runs.length}</h2>
            <p className="mt-2 text-sm text-zinc-400">Latest bot history rows.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-300">Trending Pool</p>
            <h2 className="mt-4 text-3xl font-black">{trending.length}</h2>
            <p className="mt-2 text-sm text-zinc-400">Players feeding homepage trend modules.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-300">Movement Rows</p>
            <h2 className="mt-4 text-3xl font-black">{movement.length}</h2>
            <p className="mt-2 text-sm text-zinc-400">Ranking movement snapshots.</p>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {botButtons.map((bot) => (
            <div key={bot.href} className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-sm text-zinc-400">{bot.description}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button onClick={() => runBot(bot.href)} className="rounded-2xl bg-white px-5 py-3 font-bold text-black hover:bg-blue-100">{bot.label}</button>
                <Link href={bot.href} target="_blank" className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-zinc-300 hover:bg-white hover:text-black">Open endpoint</Link>
              </div>
            </div>
          ))}
        </section>

        {statusMessage && <div className="mt-6 rounded-2xl border border-blue-400/30 bg-blue-500/10 p-4 text-sm text-blue-100">{statusMessage}</div>}
        {loading && <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900 p-4 text-sm text-zinc-400">Loading Live Engine data...</div>}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-black">Recent Bot Runs</h2>
            <div className="mt-4 grid gap-3">
              {runs.length === 0 && <p className="text-sm text-zinc-500">No bot history yet. Run the Live Engine SQL, then refresh a bot.</p>}
              {runs.map((run, index) => (
                <div key={run.id || `${run.bot_name}-${index}`} className="rounded-2xl bg-zinc-950 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{run.bot_name}</p>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-zinc-300">{run.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">{run.message || "No message recorded."}</p>
                  <p className="mt-2 text-xs text-zinc-500">{freshnessLabel(run.finished_at || run.created_at || run.started_at)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-black">Trending Inputs</h2>
            <div className="mt-4 grid gap-3">
              {trending.map((player) => (
                <Link key={player.id} href={player.slug ? `/player/${player.slug}` : "/"} className="flex items-center justify-between rounded-2xl bg-zinc-950 p-4 hover:bg-zinc-800">
                  <div>
                    <p className="font-bold">{player.name}</p>
                    <p className="text-xs text-zinc-500">{player.position || "—"} • {player.team || player.league || "Prospect"}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${movementTone(player.trend)}`}>{movementLabel(player.trend)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-2xl font-black">Ranking Movement Feed</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950 text-zinc-400"><tr><th className="px-4 py-3">Player</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Old</th><th className="px-4 py-3">New</th><th className="px-4 py-3">Move</th></tr></thead>
              <tbody>
                {movement.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No movement snapshots yet.</td></tr>}
                {movement.map((row, index) => (
                  <tr key={row.id || index} className="border-t border-white/10">
                    <td className="px-4 py-4 font-bold">{row.player_name || "Unknown player"}</td>
                    <td className="px-4 py-4 text-zinc-400">{row.category || "Consensus"}</td>
                    <td className="px-4 py-4">{row.previous_rank ? `#${row.previous_rank}` : "—"}</td>
                    <td className="px-4 py-4">{row.current_rank ? `#${row.current_rank}` : "—"}</td>
                    <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${movementTone(row.movement)}`}>{movementLabel(row.movement)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
