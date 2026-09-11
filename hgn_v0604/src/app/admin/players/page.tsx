"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminGate, useAdminSession } from "@/components/AdminGate";
import { supabase } from "@/lib/supabase";

type Player = {
  id: string;
  name: string;
  slug: string;
  team: string | null;
  league: string | null;
  position: string | null;
  category: string | null;
  rank: number | null;
  trend: number | null;
  tag: string | null;
  note: string | null;
  draft_year: string | null;
  nhl_team: string | null;
  ranking_bucket: string | null;
  is_featured?: boolean | null;
  prospect_status?: string | null;
  graduation_reason?: string | null;
  archived_reason?: string | null;
  birth_date?: string | null;
  height?: string | null;
  weight?: string | null;
  nationality?: string | null;
  needs_data?: boolean | null;
};

export default function AdminPlayersPage() {
  const { isAuthed } = useAdminSession();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Player | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  async function loadPlayers() {
    const { data, error } = await supabase
      .from("players")
      .select("id, name, slug, team, league, position, category, rank, trend, tag, note, draft_year, nhl_team, ranking_bucket, is_featured, prospect_status, graduation_reason, archived_reason, birth_date, height, weight, nationality, needs_data")
      .order("rank", { ascending: true, nullsFirst: false })
      .limit(250);
    if (error) setMessage(error.message);
    else setPlayers((data || []) as Player[]);
  }

  useEffect(() => { if (isAuthed) loadPlayers(); }, [isAuthed]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return players;
    return players.filter((p) => [p.name, p.team, p.league, p.position, p.category, p.tag, p.nhl_team, p.draft_year].filter(Boolean).join(" ").toLowerCase().includes(q));
  }, [players, search]);

  async function savePlayer() {
    if (!selected) return;
    setMessage("Saving player controls...");
    const { error } = await supabase.from("players").update({
      category: selected.category,
      rank: selected.rank,
      trend: selected.trend,
      tag: selected.tag,
      note: selected.note,
      draft_year: selected.draft_year,
      nhl_team: selected.nhl_team,
      ranking_bucket: selected.ranking_bucket,
      is_featured: selected.is_featured,
      prospect_status: selected.prospect_status || "active",
      graduation_reason: selected.graduation_reason,
      archived_reason: selected.archived_reason,
      birth_date: selected.birth_date,
      height: selected.height,
      weight: selected.weight,
      nationality: selected.nationality,
      needs_data: !!selected.needs_data,
      archived_at: selected.prospect_status === "archived" ? new Date().toISOString() : null,
    }).eq("id", selected.id);
    if (error) return setMessage(error.message);
    setMessage("Player controls saved.");
    loadPlayers();
  }

  if (!isAuthed) return (
    <AdminGate title="Player Admin" eyebrow="PuckScope Admin" description="Control homepage visibility, tags, trend arrows, ranking buckets, draft labels, prospect status, and age-out/archive settings." />
  );

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin" className="text-sm text-zinc-400 hover:text-white">← Admin dashboard</Link>
        <h1 className="mt-6 text-5xl font-black">Player Controls</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">Control homepage visibility, tags, trend arrows, ranking buckets, draft labels, prospect status, and age-out/archive settings.</p>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players..." className="mt-8 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none" />
        {message && <p className="mt-4 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 text-sm text-blue-200">{message}</p>}
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-white/10 bg-zinc-900 p-4"><div className="mb-3 text-sm text-zinc-400">{filtered.length} players</div><div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">{filtered.map((p) => <button key={p.id} onClick={() => setSelected(p)} className={`w-full rounded-2xl border p-4 text-left transition hover:border-blue-400/60 ${selected?.id === p.id ? "border-blue-400 bg-blue-500/10" : "border-white/10 bg-zinc-950"}`}><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{p.rank ? `#${p.rank} ` : ""}{p.name}</p><p className="mt-1 text-sm text-zinc-400">{[p.position, p.team, p.league].filter(Boolean).join(" • ") || "No profile labels"}</p></div><div className="flex flex-col items-end gap-2">{p.is_featured && <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-200">Featured</span>}{p.prospect_status && <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">{p.prospect_status}</span>}</div></div><p className="mt-3 text-xs text-zinc-500">{p.tag || "No tag"} {p.trend ? `• Trend ${p.trend}` : ""}</p></button>)}</div></section>
          <section className="rounded-3xl border border-white/10 bg-zinc-900 p-6">{!selected ? <div className="grid min-h-[420px] place-items-center text-center text-zinc-500">Select a player to edit homepage/admin controls.</div> : <div className="space-y-4"><div className="flex items-start justify-between gap-4"><div><p className="text-sm uppercase tracking-[0.3em] text-blue-300">Edit</p><h2 className="mt-2 text-4xl font-black">{selected.name}</h2><Link href={`/player/${selected.slug}`} className="mt-2 inline-block text-sm text-zinc-400 hover:text-white">Open public player card ↗</Link></div><label className="flex items-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm"><input type="checkbox" checked={!!selected.is_featured} onChange={(e) => setSelected({ ...selected, is_featured: e.target.checked })} />Featured</label></div><div className="grid gap-4 md:grid-cols-2"><Field label="Rank" type="number" value={selected.rank ?? ""} onChange={(v) => setSelected({ ...selected, rank: v === "" ? null : Number(v) })} /><Field label="Trend" type="number" value={selected.trend ?? ""} onChange={(v) => setSelected({ ...selected, trend: v === "" ? null : Number(v) })} /><Field label="Category" value={selected.category || ""} onChange={(v) => setSelected({ ...selected, category: v })} /><Field label="Ranking Bucket" value={selected.ranking_bucket || ""} onChange={(v) => setSelected({ ...selected, ranking_bucket: v })} /><Field label="Draft Year" value={selected.draft_year || ""} onChange={(v) => setSelected({ ...selected, draft_year: v })} /><Field label="NHL Team" value={selected.nhl_team || ""} onChange={(v) => setSelected({ ...selected, nhl_team: v })} /><Field label="Tag" value={selected.tag || ""} onChange={(v) => setSelected({ ...selected, tag: v })} /><Field label="Height" value={selected.height || ""} onChange={(v) => setSelected({ ...selected, height: v })} /><Field label="Weight" value={selected.weight || ""} onChange={(v) => setSelected({ ...selected, weight: v })} /><Field label="Nationality" value={selected.nationality || ""} onChange={(v) => setSelected({ ...selected, nationality: v })} /><Field label="Birth Date" type="date" value={selected.birth_date || ""} onChange={(v) => setSelected({ ...selected, birth_date: v })} /></div><div className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-950 p-4 md:grid-cols-2"><label><span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Prospect Status</span><select value={selected.prospect_status || "active"} onChange={(e) => setSelected({ ...selected, prospect_status: e.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-blue-400"><option value="active">Active Prospect</option><option value="drafted">Drafted Prospect</option><option value="graduated">Graduated</option><option value="archived">Archived</option></select></label><label className="flex items-center gap-2 pt-8 text-sm text-zinc-300"><input type="checkbox" checked={!!selected.needs_data} onChange={(e) => setSelected({ ...selected, needs_data: e.target.checked })} /> Needs data cleanup</label><Field label="Graduation Reason" value={selected.graduation_reason || ""} onChange={(v) => setSelected({ ...selected, graduation_reason: v })} /><Field label="Archived Reason" value={selected.archived_reason || ""} onChange={(v) => setSelected({ ...selected, archived_reason: v })} /></div><textarea value={selected.note || ""} onChange={(e) => setSelected({ ...selected, note: e.target.value })} placeholder="Public/internal note used around cards and lists..." className="min-h-36 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-400" /><button onClick={savePlayer} className="w-full rounded-2xl bg-white px-5 py-4 font-black text-black hover:bg-blue-100">Save Player Controls</button></div>}</section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string | number; type?: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-400" /></label>;
}
