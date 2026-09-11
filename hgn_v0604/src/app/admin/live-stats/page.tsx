"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminGate, useAdminSession } from "@/components/AdminGate";
import { supabase } from "@/lib/supabase";

type Source = { id: string; name: string; source_type: string | null; league: string | null; status: string | null; last_success_at: string | null; last_error: string | null };
type RecentStat = { id: string; player_slug: string | null; season: string | null; team: string | null; league: string | null; games_played: number | null; points: number | null; nhle_points: number | null; source: string | null; source_updated_at: string | null };
type PoolRow = { id: string; player_name: string; player_slug: string | null; nhl_team: string; pool_rank: number | null; role_projection: string | null; eta: string | null; fantasy_value: string | null };

function freshness(value: string | null) {
  if (!value) return "Never";
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function toNumber(value: FormDataEntryValue | null) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function LiveStatsAdminPage() {
  const { isAuthed } = useAdminSession();
  const [sources, setSources] = useState<Source[]>([]);
  const [stats, setStats] = useState<RecentStat[]>([]);
  const [poolRows, setPoolRows] = useState<PoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingManual, setSavingManual] = useState(false);
  const [manualMessage, setManualMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: sourceData }, { data: statData }, { data: poolData }] = await Promise.all([
      supabase.from("live_stat_sources").select("id, name, source_type, league, status, last_success_at, last_error").order("name"),
      supabase.from("player_stats").select("id, player_slug, season, team, league, games_played, points, nhle_points, source, source_updated_at").order("source_updated_at", { ascending: false, nullsFirst: false }).limit(20),
      supabase.from("prospect_team_pools").select("id, player_name, player_slug, nhl_team, pool_rank, role_projection, eta, fantasy_value").order("nhl_team").order("pool_rank", { ascending: true, nullsFirst: false }).limit(40),
    ]);
    setSources(sourceData || []);
    setStats(statData || []);
    setPoolRows(poolData || []);
    setLoading(false);
  }

  useEffect(() => {
    if (!isAuthed) return;
    load();
  }, [isAuthed]);

  async function saveManualStat(formData: FormData) {
    setSavingManual(true);
    setManualMessage(null);

    const slug = String(formData.get("player_slug") || "").trim().toLowerCase();
    if (!slug) {
      setManualMessage("Enter a player slug first, like gavin-mckenna.");
      setSavingManual(false);
      return;
    }

    const gp = toNumber(formData.get("games_played"));
    const goals = toNumber(formData.get("goals"));
    const assists = toNumber(formData.get("assists"));
    const points = toNumber(formData.get("points")) ?? ((goals ?? 0) + (assists ?? 0));
    const ppg = gp && gp > 0 && points !== null ? Number((points / gp).toFixed(3)) : null;

    const { data: player } = await supabase.from("players").select("id, slug").eq("slug", slug).maybeSingle();
    const payload = {
      player_id: player?.id || null,
      player_slug: slug,
      season: String(formData.get("season") || "2025-26"),
      team: String(formData.get("team") || "") || null,
      league: String(formData.get("league") || "") || null,
      games_played: gp,
      goals,
      assists,
      points,
      points_per_game: ppg,
      save_percentage: toNumber(formData.get("save_percentage")),
      goals_against_average: toNumber(formData.get("goals_against_average")),
      nhle_points: toNumber(formData.get("nhle_points")),
      source: "Manual Admin Entry",
      source_updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("player_stats").insert(payload);
    if (error) setManualMessage(`Could not save stat row: ${error.message}`);
    else {
      setManualMessage("Manual stat row saved.");
      await load();
    }
    setSavingManual(false);
  }

  const sourceSummary = useMemo(() => {
    const ready = sources.filter((s) => s.status === "ready" || s.status === "active").length;
    return { ready, total: sources.length };
  }, [sources]);

  if (!isAuthed) {
    return <AdminGate title="Live Stats Admin" eyebrow="PuckScope" description="Unlock once to manage stats imports, prospect pools, and source freshness." />;
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin" className="text-sm text-zinc-400 hover:text-white">← Back to admin</Link>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">PuckScope Live Stats</p>
            <h1 className="mt-3 text-5xl font-black">Stats + Prospect Pools</h1>
            <p className="mt-4 max-w-3xl text-zinc-400">Use CSV imports now, then swap in API/cron jobs later. This page shows freshness, recent stat rows, and actual team pool data.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/api/live-stats/status" className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-zinc-200 hover:bg-white hover:text-black">Status JSON</Link>
            <Link href="/stats" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-zinc-950 hover:bg-blue-100">Public stats page</Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric label="Sources ready" value={`${sourceSummary.ready}/${sourceSummary.total}`} />
          <Metric label="Recent stat rows" value={`${stats.length}`} />
          <Metric label="Pool rows loaded" value={`${poolRows.length}`} />
          <Metric label="Mode" value="CSV → API ready" />
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">Manual stat entry</h2>
              <p className="mt-2 max-w-2xl text-sm text-zinc-400">Use this for quick testing or one-off updates. For bigger loads, use the CSV importer below. Slug must match the player page slug.</p>
            </div>
            <Link href="/stats" className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-200 hover:bg-white hover:text-black">View public stats</Link>
          </div>
          <form action={saveManualStat} className="mt-5 grid gap-3 md:grid-cols-4">
            <Input name="player_slug" label="Player slug" placeholder="gavin-mckenna" required />
            <Input name="season" label="Season" placeholder="2025-26" />
            <Input name="team" label="Team" placeholder="Medicine Hat" />
            <Input name="league" label="League" placeholder="WHL" />
            <Input name="games_played" label="GP" placeholder="35" />
            <Input name="goals" label="G" placeholder="20" />
            <Input name="assists" label="A" placeholder="45" />
            <Input name="points" label="PTS" placeholder="65" />
            <Input name="nhle_points" label="NHLe" placeholder="42.5" />
            <Input name="save_percentage" label="Goalie SV%" placeholder="0.915" />
            <Input name="goals_against_average" label="Goalie GAA" placeholder="2.35" />
            <div className="flex items-end"><button disabled={savingManual} className="w-full rounded-2xl bg-blue-400 px-5 py-3 text-sm font-black text-zinc-950 hover:bg-blue-300 disabled:cursor-not-allowed disabled:opacity-60">{savingManual ? "Saving..." : "Save stat row"}</button></div>
          </form>
          {manualMessage && <p className="mt-4 rounded-2xl border border-white/10 bg-zinc-950 p-4 text-sm text-zinc-300">{manualMessage}</p>}
        </section>

        <section className="mt-8 rounded-3xl border border-blue-400/20 bg-blue-500/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">Optional advanced import commands</h2><Link href="/admin/imports" className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-zinc-200 hover:bg-white hover:text-black">Open Data Import Center</Link></div>
          <div className="mt-4 grid gap-3 text-sm text-zinc-300 md:grid-cols-3">
            <CodeCard title="Live stats CSV" code="node scripts/import-live-player-stats-csv.mjs imports/live-player-stats-template.csv" />
            <CodeCard title="Team pools CSV" code="node scripts/import-team-prospect-pools-csv.mjs imports/team-prospect-pools-template.csv" />
            <CodeCard title="Player videos CSV" code="node scripts/import-player-videos-csv.mjs imports/player-videos-template.csv" />
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-black">Stat sources</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm"><thead className="bg-zinc-950 text-zinc-400"><tr><th className="px-4 py-3">Source</th><th className="px-4 py-3">League</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Freshness</th></tr></thead><tbody>{loading ? <tr><td colSpan={4} className="px-4 py-6 text-zinc-500">Loading...</td></tr> : sources.map((source) => <tr key={source.id} className="border-t border-white/10"><td className="px-4 py-3 font-bold">{source.name}</td><td className="px-4 py-3">{source.league || "—"}</td><td className="px-4 py-3">{source.status || "—"}</td><td className="px-4 py-3 text-zinc-400">{freshness(source.last_success_at)}</td></tr>)}</tbody></table>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-black">Recent stats</h2>
            <div className="mt-4 grid gap-3">{stats.length === 0 ? <p className="rounded-2xl bg-zinc-950 p-4 text-sm text-zinc-500">No stat rows yet.</p> : stats.map((row) => <div key={row.id} className="rounded-2xl bg-zinc-950 p-4"><div className="flex justify-between gap-3"><p className="font-bold">{row.player_slug || "Unknown player"}</p><p className="text-sm text-blue-300">{row.league || "—"}</p></div><p className="mt-1 text-sm text-zinc-400">{row.team || "—"} • {row.season || "—"} • GP {row.games_played ?? "—"} • PTS {row.points ?? "—"} • NHLe {row.nhle_points ?? "—"}</p><p className="mt-1 text-xs text-zinc-600">{row.source || "Manual"} • {freshness(row.source_updated_at)}</p></div>)}</div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-2xl font-black">Team prospect pool rows</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-zinc-950 text-zinc-400"><tr><th className="px-4 py-3">Team</th><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Player</th><th className="px-4 py-3">Projection</th><th className="px-4 py-3">ETA</th><th className="px-4 py-3">Fantasy</th></tr></thead><tbody>{poolRows.length === 0 ? <tr><td colSpan={6} className="px-4 py-6 text-zinc-500">No team pool rows loaded yet.</td></tr> : poolRows.map((row) => <tr key={row.id} className="border-t border-white/10"><td className="px-4 py-3">{row.nhl_team}</td><td className="px-4 py-3 font-black">#{row.pool_rank || "—"}</td><td className="px-4 py-3 font-bold">{row.player_slug ? <Link href={`/player/${row.player_slug}`} className="hover:text-blue-300">{row.player_name}</Link> : row.player_name}</td><td className="px-4 py-3 text-zinc-400">{row.role_projection || "—"}</td><td className="px-4 py-3 text-zinc-400">{row.eta || "—"}</td><td className="px-4 py-3 text-zinc-400">{row.fantasy_value || "—"}</td></tr>)}</tbody></table></div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5"><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>;
}

function CodeCard({ title, code }: { title: string; code: string }) {
  return <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4"><p className="font-bold text-white">{title}</p><code className="mt-3 block whitespace-pre-wrap rounded-xl bg-black p-3 text-xs text-blue-200">{code}</code></div>;
}

function Input({ name, label, placeholder, required = false }: { name: string; label: string; placeholder?: string; required?: boolean }) {
  return <label className="block text-sm"><span className="mb-2 block text-zinc-400">{label}</span><input name={name} required={required} placeholder={placeholder} className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-300" /></label>;
}
