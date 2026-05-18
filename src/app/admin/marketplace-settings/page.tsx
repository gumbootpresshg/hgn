"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Row = { id: string; name: string; sort_order?: number; is_active?: boolean };

function SettingsList({ table, title, placeholder }: { table: string; title: string; placeholder: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data, error } = await supabase.from(table).select("*").order("sort_order", { ascending: true }).order("name", { ascending: true });
    if (error) setMessage(error.message); else setRows(data || []);
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase.from(table).insert({ name: name.trim(), is_active: true, sort_order: rows.length + 1 });
    if (error) alert(error.message); else { setName(""); load(); }
  }

  async function toggle(row: Row) {
    const { error } = await supabase.from(table).update({ is_active: !row.is_active }).eq("id", row.id);
    if (error) alert(error.message); else load();
  }

  async function rename(row: Row) {
    const next = prompt("New name", row.name);
    if (!next?.trim()) return;
    const { error } = await supabase.from(table).update({ name: next.trim() }).eq("id", row.id);
    if (error) alert(error.message); else load();
  }

  async function remove(row: Row) {
    if (!confirm(`Delete ${row.name}? Existing listings keep their old text, but the option will be removed.`)) return;
    const { error } = await supabase.from(table).delete().eq("id", row.id);
    if (error) alert(error.message); else load();
  }

  return (
    <section className="hgn-card p-6">
      <h2 className="text-2xl font-black text-hgnNavy">{title}</h2>
      <form onSubmit={add} className="mt-4 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={placeholder} />
        <button className="hgn-btn-primary shrink-0">Add</button>
      </form>
      {message && <p className="mt-3 font-semibold text-hgnBlue">{message}</p>}
      <div className="mt-5 grid gap-2">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3">
            <div>
              <div className="font-black text-hgnNavy">{row.name}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">{row.is_active ? "Active" : "Hidden"}</div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => rename(row)} className="rounded-lg bg-white px-3 py-2 text-sm font-black text-hgnNavy">Rename</button>
              <button type="button" onClick={() => toggle(row)} className="rounded-lg bg-white px-3 py-2 text-sm font-black text-hgnNavy">{row.is_active ? "Hide" : "Show"}</button>
              <button type="button" onClick={() => remove(row)} className="rounded-lg bg-hgnBlue px-3 py-2 text-sm font-black text-white">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function MarketplaceSettingsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/admin" className="text-sm font-black text-hgnBlue">← Back to command centre</Link>
      <div className="mt-4 border-b pb-6">
        <div className="text-sm font-black uppercase tracking-widest text-hgnBlue">Admin</div>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Marketplace Settings</h1>
        <p className="mt-3 max-w-3xl text-slate-700">Control the categories and towns people can choose when submitting marketplace listings. No code changes needed.</p>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SettingsList table="marketplace_categories" title="Categories" placeholder="Example: Boats" />
        <SettingsList table="marketplace_towns" title="Towns / locations" placeholder="Example: Queen Charlotte" />
      </div>
    </main>
  );
}
