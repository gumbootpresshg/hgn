"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Player = {
  id: string;
  slug: string | null;
  name: string;
  team: string | null;
  league: string | null;
  position: string | null;
  rank: number | null;
  avg_rank: number | null;
  trend: number | null;
  tag: string | null;
  draft_year: string | null;
  nhl_team: string | null;
  category: string | null;
  nationality: string | null;
  nhle: number | null;
  fantasy_upside: number | null;
  prospect_status?: string | null;
  birth_date?: string | null;
};

const quickTabs = [
  { label: "All", value: "all" },
  { label: "Trending", value: "trending" },
  { label: "Sleepers", value: "sleepers" },
  { label: "Goalies", value: "goalies" },
  { label: "2027 Watch", value: "2027" },
  { label: "Drafted", value: "drafted" },
  { label: "Undrafted", value: "undrafted" },
  { label: "Archived", value: "archived" },
];

function unique(values: Array<string | null | undefined>) {
  return ["All", ...Array.from(new Set(values.filter(Boolean) as string[])).sort()];
}

const CURRENT_DRAFT_YEAR = 2026;

function draftYearNumber(value: string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isActiveProspect(player: Player) {
  if (player.prospect_status === "graduated" || player.prospect_status === "archived") return false;
  const year = draftYearNumber(player.draft_year);
  if (!year) return true;
  if (!player.nhl_team) return year >= CURRENT_DRAFT_YEAR - 4;
  return year >= CURRENT_DRAFT_YEAR - 6;
}

function TrendBadge({ trend }: { trend: number | null }) {
  if (!trend) return <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-500">—</span>;
  if (trend > 0) return <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">↑ {trend}</span>;
  return <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-300">↓ {Math.abs(trend)}</span>;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [position, setPosition] = useState("All");
  const [league, setLeague] = useState("All");
  const [draftYear, setDraftYear] = useState("All");
  const [nhlTeam, setNhlTeam] = useState("All");
  const [nationality, setNationality] = useState("All");
  const [sortBy, setSortBy] = useState("rank");

  useEffect(() => {
    async function loadPlayers() {
      setLoading(true);
      const { data, error } = await supabase
        .from("players")
        .select("id, slug, name, team, league, position, rank, avg_rank, trend, tag, draft_year, nhl_team, category, nationality, nhle, fantasy_upside, prospect_status, birth_date")
        .order("rank", { ascending: true, nullsFirst: false })
        .limit(500);

      if (error) {
        console.error("Could not load player database:", error.message);
        setPlayers([]);
      } else {
        setPlayers((data || []) as Player[]);
      }
      setLoading(false);
    }
    loadPlayers();
  }, []);

  const filters = useMemo(() => ({
    positions: unique(players.map((p) => p.position)),
    leagues: unique(players.map((p) => p.league)),
    draftYears: unique(players.map((p) => p.draft_year)),
    nhlTeams: unique(players.map((p) => p.nhl_team)),
    nationalities: unique(players.map((p) => p.nationality)),
  }), [players]);

  const visiblePlayers = useMemo(() => {
    const q = search.toLowerCase().trim();

    return [...players]
      .filter((p) => {
        if (tab === "trending") return !!p.trend && p.trend !== 0;
        if (tab === "sleepers") return (p.tag || p.category || "").toLowerCase().includes("sleeper");
        if (tab === "goalies") return (p.position || "").toLowerCase().includes("g");
        if (tab === "2027") return p.draft_year === "2027";
        if (tab === "drafted") return !!p.nhl_team;
        if (tab === "undrafted") return !p.nhl_team && isActiveProspect(p);
        if (tab === "archived") return !isActiveProspect(p) || p.prospect_status === "archived" || p.prospect_status === "graduated";
        return isActiveProspect(p);
      })
      .filter((p) => !q || [p.name, p.team, p.league, p.position, p.nhl_team, p.nationality, p.tag].some((value) => (value || "").toLowerCase().includes(q)))
      .filter((p) => position === "All" || p.position === position)
      .filter((p) => league === "All" || p.league === league)
      .filter((p) => draftYear === "All" || p.draft_year === draftYear)
      .filter((p) => nhlTeam === "All" || p.nhl_team === nhlTeam)
      .filter((p) => nationality === "All" || p.nationality === nationality)
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "trend") return Math.abs(b.trend || 0) - Math.abs(a.trend || 0);
        if (sortBy === "nhle") return (b.nhle || 0) - (a.nhle || 0);
        if (sortBy === "fantasy") return (b.fantasy_upside || 0) - (a.fantasy_upside || 0);
        return (a.rank || a.avg_rank || 9999) - (b.rank || b.avg_rank || 9999);
      });
  }, [players, search, tab, position, league, draftYear, nhlTeam, nationality, sortBy]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_35%)] px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <Link href="/" className="text-sm font-semibold text-blue-300 hover:text-blue-200">← Back to PuckScope</Link>
          <div className="mt-8 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Player Database</p>
              <h1 className="mt-3 text-5xl font-black tracking-tight md:text-7xl">Find every prospect.</h1>
              <p className="mt-5 max-w-3xl text-lg text-zinc-300">Search, filter, and sort the PuckScope prospect database. Default results show active prospects only, while older drafted players move to Archived so the database does not treat 30-year-olds like prospects.</p>
            </div>
            <Link href="/submit" className="rounded-2xl bg-white px-6 py-4 text-center font-black text-black hover:bg-blue-100">Submit / Claim Profile</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-3xl border border-white/10 bg-zinc-900 p-5">
          <div className="flex flex-wrap gap-2">
            {quickTabs.map((item) => (
              <button key={item.value} onClick={() => setTab(item.value)} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === item.value ? "bg-blue-500 text-white" : "bg-zinc-950 text-zinc-300 hover:bg-zinc-800"}`}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, team, league..." className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-400 md:col-span-2" />
            <Select value={position} onChange={setPosition} options={filters.positions} />
            <Select value={league} onChange={setLeague} options={filters.leagues} />
            <Select value={draftYear} onChange={setDraftYear} options={filters.draftYears} />
            <Select value={nhlTeam} onChange={setNhlTeam} options={filters.nhlTeams} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-400">
              <option value="rank">Sort: Rank</option>
              <option value="trend">Sort: Trend</option>
              <option value="nhle">Sort: NHLe</option>
              <option value="fantasy">Sort: Fantasy</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>

          <div className="mt-3">
            <Select value={nationality} onChange={setNationality} options={filters.nationalities} label="Nationality" />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between text-sm text-zinc-400">
          <span>{loading ? "Loading database..." : `${visiblePlayers.length} prospects shown`}</span>
          <span>Tip: use quick tabs for Goalies, Sleepers, and 2027 Watch.</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visiblePlayers.map((player) => (
            <Link key={player.id} href={player.slug ? `/player/${player.slug}` : "#"} className="rounded-3xl border border-white/10 bg-zinc-900 p-5 hover:border-blue-400/60 hover:bg-zinc-850">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-blue-300">{player.rank ? `#${player.rank}` : player.avg_rank ? `Avg #${Math.round(player.avg_rank)}` : "Unranked"}</p>
                  <h2 className="mt-1 text-2xl font-black">{player.name}</h2>
                  <p className="mt-1 text-sm text-zinc-400">{player.position || "—"} • {player.team || "—"} • {player.league || "—"}</p>
                </div>
                <TrendBadge trend={player.trend} />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
                <Metric label="Draft" value={player.draft_year || "—"} />
                <Metric label="NHL Rights" value={player.nhl_team || "—"} />
                <Metric label="NHLe" value={player.nhle ? String(player.nhle) : "—"} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-400">
                {player.nationality && <span className="rounded-full bg-zinc-950 px-3 py-1">{player.nationality}</span>}
                {player.tag && <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-200">{player.tag}</span>}
                {player.category && <span className="rounded-full bg-zinc-950 px-3 py-1">{player.category}</span>}
                {player.prospect_status && player.prospect_status !== "active" && <span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-200">{player.prospect_status}</span>}
              </div>
            </Link>
          ))}
        </div>

        {!loading && visiblePlayers.length === 0 && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-10 text-center text-zinc-400">No players match those filters yet.</div>
        )}
      </section>
    </main>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (value: string) => void; options: string[]; label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</span>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-400">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-950 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 truncate font-black text-zinc-100">{value}</p>
    </div>
  );
}
