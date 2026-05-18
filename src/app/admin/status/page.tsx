"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Check = { name: string; table: string; ok?: boolean; count?: number; error?: string };

const checks: Check[] = [
  { name: "Articles", table: "articles" },
  { name: "Letters", table: "letters_to_editor" },
  { name: "Marketplace", table: "classifieds" },
  { name: "Events", table: "community_events" },
  { name: "Live Map", table: "live_map_items" },
  { name: "Ask Annie", table: "ask_annie_questions" },
  { name: "Photo Submissions", table: "photo_submissions" },
  { name: "Story Tips", table: "story_tips" },
  { name: "Corrections", table: "correction_requests" },
  { name: "Ad Placements", table: "ad_placements" },
  { name: "Site Alerts", table: "site_alerts" },
  { name: "Staff Assignments", table: "assignments" },
  { name: "Upcoming Editions", table: "print_editions" },
  { name: "Audience Members", table: "audience_members" },
];

export default function AdminStatusPage() {
  const [rows, setRows] = useState<Check[]>(checks);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { runChecks(); }, []);

  async function runChecks() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const userEmail = userData.user?.email?.toLowerCase() || "";
    setEmail(userEmail);
    if (userEmail) {
      const { data } = await supabase.from("user_roles").select("role").ilike("email", userEmail).maybeSingle();
      setRole(data?.role || "contributor");
    }

    const results: Check[] = [];
    for (const item of checks) {
      const { count, error } = await supabase.from(item.table).select("id", { count: "exact", head: true });
      results.push({ ...item, ok: !error, count: count || 0, error: error?.message });
    }
    setRows(results);
    setLoading(false);
  }

  const good = rows.filter((r) => r.ok).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-black uppercase tracking-widest text-hgnBlue">Admin</div>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Site Health Check</h1>
          <p className="mt-3 max-w-3xl text-slate-700">A quick way to find what is actually connected before you import WordPress articles. Green means the table is reachable and ready.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={runChecks} className="hgn-btn-primary">Run check again</button>
          <Link href="/admin" className="hgn-btn-dark">Back to command centre</Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="hgn-card p-5"><div className="text-xs font-black uppercase text-slate-500">Signed in as</div><div className="mt-1 text-xl font-black text-hgnNavy">{email || "Not signed in"}</div></div>
        <div className="hgn-card p-5"><div className="text-xs font-black uppercase text-slate-500">Role</div><div className="mt-1 text-xl font-black text-hgnNavy">{role || "Unknown"}</div></div>
        <div className="hgn-card p-5"><div className="text-xs font-black uppercase text-slate-500">Ready tables</div><div className="mt-1 text-xl font-black text-hgnNavy">{good} / {rows.length}</div></div>
      </div>

      {loading && <div className="hgn-card mt-6 p-6">Checking Supabase...</div>}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {rows.map((row) => (
          <div key={row.table} className="hgn-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div><h2 className="text-xl font-black text-hgnNavy">{row.name}</h2><p className="text-sm text-slate-500">{row.table}</p></div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${row.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-hgnBlue"}`}>{row.ok ? "READY" : "FIX"}</span>
            </div>
            <p className="mt-3 text-sm text-slate-700">{row.ok ? `${row.count || 0} records found.` : row.error}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
