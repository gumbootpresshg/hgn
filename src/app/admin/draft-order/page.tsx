"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminGate, useAdminSession } from "@/components/AdminGate";
import { supabase } from "@/lib/supabase";

type DraftOrderRow = {
  id?: string;
  draft_year: number;
  order_type: string;
  pick_number: number;
  team_name: string;
  team_slug: string | null;
  notes: string | null;
};

const starterOrder = [
  "Vancouver Canucks", "Chicago Blackhawks", "New York Rangers", "Calgary Flames",
  "Toronto Maple Leafs", "Seattle Kraken", "Winnipeg Jets", "Florida Panthers",
  "San Jose Sharks", "Nashville Predators", "Anaheim Ducks", "Columbus Blue Jackets",
  "Montreal Canadiens", "Utah Mammoth", "Ottawa Senators", "Buffalo Sabres",
  "Philadelphia Flyers", "New Jersey Devils", "Detroit Red Wings", "Minnesota Wild",
  "Pittsburgh Penguins", "St. Louis Blues", "Washington Capitals", "New York Islanders",
  "Los Angeles Kings", "Vegas Golden Knights", "Tampa Bay Lightning", "Colorado Avalanche",
  "Carolina Hurricanes", "Boston Bruins", "Edmonton Oilers", "Dallas Stars",
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function rowsFromTeams(teams: string[], draftYear: number, orderType: string): DraftOrderRow[] {
  return teams.filter(Boolean).slice(0, 32).map((team, index) => ({
    draft_year: draftYear,
    order_type: orderType,
    pick_number: index + 1,
    team_name: team.trim(),
    team_slug: slugify(team),
    notes: "",
  }));
}

export default function AdminDraftOrderPage() {
  const { isAuthed } = useAdminSession();
  const [draftYear, setDraftYear] = useState(2026);
  const [orderType, setOrderType] = useState("projected_pre_lottery");
  const [rows, setRows] = useState<DraftOrderRow[]>(() => rowsFromTeams(starterOrder, 2026, "projected_pre_lottery"));
  const [bulkText, setBulkText] = useState(starterOrder.join("\n"));
  const [message, setMessage] = useState("");

  const cleanTeams = useMemo(() => bulkText.split("\n").map((x) => x.trim()).filter(Boolean), [bulkText]);

  async function loadOrder() {
    setMessage("Loading draft order...");
    const { data, error } = await supabase
      .from("draft_orders")
      .select("id, draft_year, order_type, pick_number, team_name, team_slug, notes")
      .eq("draft_year", draftYear)
      .eq("order_type", orderType)
      .order("pick_number", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data?.length) {
      setRows(data as DraftOrderRow[]);
      setBulkText(data.map((row) => row.team_name).join("\n"));
      setMessage(`Loaded ${data.length} picks.`);
    } else {
      const starter = rowsFromTeams(starterOrder, draftYear, orderType);
      setRows(starter);
      setBulkText(starter.map((row) => row.team_name).join("\n"));
      setMessage("No saved order yet. Using starter order.");
    }
  }

  useEffect(() => { if (isAuthed) loadOrder(); }, [isAuthed, draftYear, orderType]);

  function applyBulkText() {
    const nextRows = rowsFromTeams(cleanTeams, draftYear, orderType);
    setRows(nextRows);
    setMessage(`Applied ${nextRows.length} teams from the draft-order box.`);
  }

  function movePick(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    const renumbered = next.map((row, idx) => ({ ...row, pick_number: idx + 1 }));
    setRows(renumbered);
    setBulkText(renumbered.map((row) => row.team_name).join("\n"));
  }

  function updateRow(index: number, field: "team_name" | "notes", value: string) {
    const next = rows.map((row, idx) => idx === index ? { ...row, [field]: value, team_slug: field === "team_name" ? slugify(value) : row.team_slug } : row);
    setRows(next);
    setBulkText(next.map((row) => row.team_name).join("\n"));
  }

  async function saveOrder() {
    setMessage("Saving draft order...");
    const payload = rows.map((row, index) => ({
      draft_year: draftYear,
      order_type: orderType,
      pick_number: index + 1,
      team_name: row.team_name,
      team_slug: row.team_slug || slugify(row.team_name),
      notes: row.notes || null,
    }));

    const { error } = await supabase
      .from("draft_orders")
      .upsert(payload, { onConflict: "draft_year,order_type,pick_number" });

    if (error) setMessage(error.message);
    else setMessage("Draft order saved. Mock Draft can now use this as the admin-controlled source.");
  }

  function exportCsv() {
    const header = "draft_year,order_type,pick_number,team_name,team_slug,notes";
    const body = rows.map((row) => [draftYear, orderType, row.pick_number, row.team_name, row.team_slug || "", row.notes || ""].map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    navigator.clipboard.writeText(`${header}\n${body}`);
    setMessage("Draft order CSV copied to clipboard.");
  }

  if (!isAuthed) return <AdminGate title="Draft Order Admin" eyebrow="PuckScope Admin" description="Edit and save the projected NHL draft order used by mock draft tools." />;

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin" className="text-sm text-zinc-400 hover:text-white">← Admin dashboard</Link>
        <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-blue-300">PuckScope Admin</p>
            <h1 className="mt-3 text-5xl font-black">Draft Order Control</h1>
            <p className="mt-3 max-w-3xl text-zinc-400">Manage the projected pre-lottery order, final lottery order, or any custom order without editing code. Paste one team per line, reorder picks, then save.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={loadOrder} className="rounded-2xl border border-white/10 px-5 py-3 font-bold text-zinc-200 hover:bg-white hover:text-black">Reload</button>
            <button onClick={saveOrder} className="rounded-2xl bg-white px-5 py-3 font-black text-black hover:bg-blue-100">Save Order</button>
          </div>
        </div>

        {message && <p className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 text-sm text-blue-200">{message}</p>}

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-black">Bulk order editor</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block"><span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Draft year</span><input type="number" value={draftYear} onChange={(e) => setDraftYear(Number(e.target.value) || 2026)} className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-400" /></label>
              <label className="block"><span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Order type</span><select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-400"><option value="projected_pre_lottery">Projected pre-lottery</option><option value="post_lottery">Post-lottery</option><option value="final">Final draft order</option><option value="custom">Custom</option></select></label>
            </div>
            <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} className="mt-5 min-h-[520px] w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 font-mono text-sm outline-none focus:border-blue-400" />
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={applyBulkText} className="rounded-2xl bg-blue-500 px-5 py-3 font-black text-white hover:bg-blue-400">Apply {cleanTeams.length} Teams</button>
              <button onClick={() => setBulkText(starterOrder.join("\n"))} className="rounded-2xl border border-white/10 px-5 py-3 font-bold text-zinc-200 hover:bg-zinc-800">Restore Starter</button>
              <button onClick={exportCsv} className="rounded-2xl border border-white/10 px-5 py-3 font-bold text-zinc-200 hover:bg-zinc-800">Copy CSV</button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-black">Pick list</h2>
            <p className="mt-2 text-sm text-zinc-400">Use arrows for quick changes, or edit team names directly.</p>
            <div className="mt-5 max-h-[720px] space-y-3 overflow-y-auto pr-1">
              {rows.map((row, index) => (
                <div key={index} className="grid gap-3 rounded-2xl border border-white/10 bg-zinc-950 p-4 md:grid-cols-[64px_1fr_1.3fr_96px] md:items-center">
                  <div className="text-2xl font-black text-blue-300">#{index + 1}</div>
                  <input value={row.team_name} onChange={(e) => updateRow(index, "team_name", e.target.value)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 outline-none focus:border-blue-400" />
                  <input value={row.notes || ""} onChange={(e) => updateRow(index, "notes", e.target.value)} placeholder="Notes" className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 outline-none focus:border-blue-400" />
                  <div className="flex gap-2"><button onClick={() => movePick(index, -1)} className="rounded-xl border border-white/10 px-3 py-2 hover:bg-zinc-800">↑</button><button onClick={() => movePick(index, 1)} className="rounded-xl border border-white/10 px-3 py-2 hover:bg-zinc-800">↓</button></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
