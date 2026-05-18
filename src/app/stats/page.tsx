import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatNumber, statFreshnessLabel } from "@/lib/liveStats";

type StatRow = {
  id: string;
  player_slug: string | null;
  season: string | null;
  team: string | null;
  league: string | null;
  games_played: number | null;
  goals: number | null;
  assists: number | null;
  points: number | null;
  points_per_game: number | null;
  nhle_points: number | null;
  save_percentage: number | null;
  goals_against_average: number | null;
  source_updated_at: string | null;
  source: string | null;
};

function hasRealStats(row: StatRow) {
  const skaterTotal = (row.games_played || 0) + (row.goals || 0) + (row.assists || 0) + (row.points || 0) + (row.nhle_points || 0);
  const goalieTotal = (row.games_played || 0) + (row.save_percentage || 0) + (row.goals_against_average || 0);
  return skaterTotal > 0 || goalieTotal > 0;
}

function displayNameFromSlug(slug: string | null) {
  if (!slug) return "Unknown player";
  return slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export default async function StatsPage() {
  const { data, error } = await supabase
    .from("player_stats")
    .select("id, player_slug, season, team, league, games_played, goals, assists, points, points_per_game, nhle_points, save_percentage, goals_against_average, source, source_updated_at")
    .order("source_updated_at", { ascending: false, nullsFirst: false })
    .limit(150);

  const allRows = ((data || []) as StatRow[]).filter((row) => row.player_slug);
  const rows = allRows.filter(hasRealStats);
  const hiddenEmptyRows = allRows.length - rows.length;
  const skaters = rows.filter((row) => row.save_percentage === null || row.save_percentage === undefined);
  const goalies = rows.filter((row) => row.save_percentage !== null && row.save_percentage !== undefined);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white">← Back to PuckScope</Link>
          <Link href="/players" className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-zinc-200 hover:bg-white hover:text-black">Player Database</Link>
        </div>
        <section className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">PuckScope Live Stats</p>
          <h1 className="mt-3 text-5xl font-black">Prospect Stats Hub</h1>
          <p className="mt-4 max-w-3xl text-zinc-400">Imported player stats, goalie tracking, NHLe signals, and freshness. Empty starter rows are hidden until real GP/production is loaded.</p>
          {error && <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">Could not load stats: {error.message}</p>}
          {!error && rows.length === 0 && (
            <div className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5 text-sm text-blue-100">
              <p className="font-bold">No real stat rows loaded yet.</p>
              <p className="mt-1 text-blue-100/80">Use Admin → Live Stats to add a manual row or import <code>imports/live-player-stats-template.csv</code>.</p>
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric label="Visible stat rows" value={`${rows.length}`} />
          <Metric label="Skaters" value={`${skaters.length}`} />
          <Metric label="Goalies" value={`${goalies.length}`} />
          <Metric label="Hidden empty rows" value={`${hiddenEmptyRows}`} />
        </section>

        <StatsTable title="Skater leaderboard" rows={skaters.slice(0, 50)} />
        <StatsTable title="Goalie tracker" rows={goalies.slice(0, 30)} goalie />
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5"><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-xl font-black">{value}</p></div>;
}

function StatsTable({ title, rows, goalie = false }: { title: string; rows: StatRow[]; goalie?: boolean }) {
  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-6">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Player</th><th className="px-4 py-3">Team</th><th className="px-4 py-3">League</th><th className="px-4 py-3">GP</th>
              {goalie ? <><th className="px-4 py-3">SV%</th><th className="px-4 py-3">GAA</th></> : <><th className="px-4 py-3">G</th><th className="px-4 py-3">A</th><th className="px-4 py-3">PTS</th><th className="px-4 py-3">PPG</th><th className="px-4 py-3">NHLe</th></>}
              <th className="px-4 py-3">Freshness</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={goalie ? 7 : 10} className="px-4 py-8 text-center text-zinc-500">No stats imported yet.</td></tr> : rows.map((row) => {
              const href = row.player_slug ? `/player/${row.player_slug}` : "#";
              return <tr key={row.id} className="border-t border-white/10 hover:bg-white/[0.03]"><td className="px-4 py-3 font-bold">{row.player_slug ? <Link href={href} className="hover:text-blue-300">{displayNameFromSlug(row.player_slug)}</Link> : "Unknown"}</td><td className="px-4 py-3 text-zinc-300">{row.team || "—"}</td><td className="px-4 py-3 text-zinc-300">{row.league || "—"}</td><td className="px-4 py-3">{row.games_played ?? "—"}</td>{goalie ? <><td className="px-4 py-3">{formatNumber(row.save_percentage, 3)}</td><td className="px-4 py-3">{formatNumber(row.goals_against_average, 2)}</td></> : <><td className="px-4 py-3">{row.goals ?? "—"}</td><td className="px-4 py-3">{row.assists ?? "—"}</td><td className="px-4 py-3 font-black">{row.points ?? "—"}</td><td className="px-4 py-3">{formatNumber(row.points_per_game, 2)}</td><td className="px-4 py-3 text-blue-300">{formatNumber(row.nhle_points, 1)}</td></>}<td className="px-4 py-3 text-xs text-zinc-500">{statFreshnessLabel(row.source_updated_at)}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
