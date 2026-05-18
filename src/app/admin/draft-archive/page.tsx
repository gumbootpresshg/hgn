"use client";

import Link from "next/link";
import { AdminGate, useAdminSession } from "@/components/AdminGate";

export default function AdminDraftArchivePage() {
  const { isAuthed } = useAdminSession();
  if (!isAuthed) {
    return <AdminGate title="Draft Archive Admin" description="Unlock historical draft import and archive management tools." />;
  }

  const template = `draft_year,round,pick_in_round,overall_pick,player_name,position,drafted_by,amateur_team,amateur_league,nationality,nhl_games,nhl_goals,nhl_assists,nhl_points,current_team,status,puckscope_note2015,1,1,1,Connor McDavid,C,Edmonton Oilers,Erie Otters,OHL,Canada,0,0,0,0,Edmonton Oilers,active,Replace stats with current totals.`;

  async function copyTemplate() {
    await navigator.clipboard.writeText(template);
    alert("CSV template copied.");
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/admin" className="text-zinc-400 hover:text-white">← Admin</Link>
          <div className="flex flex-wrap gap-2">
            <Link href="/history" className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-blue-500 hover:text-white">View Archive</Link>
            <Link href="/history/drafts/2015" className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-blue-500 hover:text-white">2015 example</Link>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-blue-400/20 bg-gradient-to-br from-zinc-900 to-black p-8">
          <p className="text-sm font-black uppercase tracking-[0.32em] text-blue-300">PuckScope Draft Archive</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight">Historical Data Engine</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-300">Import full NHL draft results by CSV, maintain re-draft boards, and turn every draft year/team page into SEO inventory.</p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-black">1. Run SQL</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Run this file in Supabase SQL Editor before importing:</p>
            <code className="mt-4 block rounded-2xl bg-black p-4 text-sm text-blue-200">supabase/puckscope_draft_archive_data_engine.sql</code>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-black">2. Fill CSV</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Use the starter template at:</p>
            <code className="mt-4 block rounded-2xl bg-black p-4 text-sm text-blue-200">imports/nhl-draft-history-template.csv</code>
            <button onClick={copyTemplate} className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-black text-black hover:bg-blue-100">Copy mini template</button>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-black">3. Import</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Run from VS Code terminal:</p>
            <code className="mt-4 block rounded-2xl bg-black p-4 text-sm text-blue-200">node scripts/import-nhl-draft-history-csv.mjs imports/your-file.csv</code>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-3xl font-black">Archive Roadmap</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {["Import every NHL draft year", "Add current career totals", "Create editorial redraft boards", "Mark steals and busts", "Build team draft history pages", "Turn top years into SEO articles"].map((item) => (
              <div key={item} className="rounded-2xl bg-zinc-950 p-4 text-sm font-semibold text-zinc-300">{item}</div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
