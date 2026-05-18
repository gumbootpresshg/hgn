"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Invoice = {
  id: string;
  customer_name: string;
  customer_email?: string | null;
  description?: string | null;
  amount_cents: number;
  status: string;
  square_checkout_url?: string | null;
  due_date?: string | null;
  created_at?: string | null;
};

function money(cents?: number) {
  return `$${((cents || 0) / 100).toFixed(2)}`;
}

export default function AccountingPage() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data, error } = await supabase
      .from("accounting_invoices")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) setMessage(error.message); else setRows(data || []);
  }

  async function createInvoice(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const amount = Number(f.get("amount") || 0);
    const payload = {
      customer_name: String(f.get("customer_name") || "").trim(),
      customer_email: String(f.get("customer_email") || "").trim(),
      description: String(f.get("description") || "").trim(),
      amount_cents: Math.round(amount * 100),
      status: "draft",
      due_date: f.get("due_date") || null,
      square_checkout_url: String(f.get("square_checkout_url") || "").trim() || null,
    };
    const { error } = await supabase.from("accounting_invoices").insert(payload);
    if (error) alert(error.message); else { e.currentTarget.reset(); load(); }
  }

  async function markStatus(id: string, status: string) {
    const { error } = await supabase.from("accounting_invoices").update({ status }).eq("id", id);
    if (error) alert(error.message); else load();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <Link href="/admin" className="text-sm font-black text-hgnBlue">← Back to command centre</Link>
      <div className="mt-4 border-b pb-6">
        <div className="text-sm font-black uppercase tracking-widest text-hgnBlue">Admin</div>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">Accounting & Square Payments</h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          Phase 1 is Square hosted checkout links: create a draft invoice/ad order here, paste the Square payment link, and track paid/unpaid status. Later phases can use Square webhooks and recurring subscriptions.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
        <form onSubmit={createInvoice} className="hgn-card grid gap-4 p-6">
          <h2 className="text-2xl font-black text-hgnNavy">Create invoice / ad order</h2>
          <label>Customer / business name<input name="customer_name" required /></label>
          <label>Email<input name="customer_email" type="email" /></label>
          <label>Description<textarea name="description" rows={4} placeholder="Example: Homepage banner ad, May 1–31" /></label>
          <label>Amount<input name="amount" type="number" min="0" step="0.01" required /></label>
          <label>Due date<input name="due_date" type="date" /></label>
          <label>Square checkout link<input name="square_checkout_url" placeholder="https://square.link/u/..." /></label>
          <button className="hgn-btn-primary">Save draft</button>
          <p className="text-xs leading-5 text-slate-500">For now, create the payment link in Square, paste it here, and send it to the advertiser. Webhook automation comes next.</p>
        </form>

        <section className="grid gap-4">
          {message && <div className="rounded-xl bg-red-50 p-4 font-bold text-hgnBlue">{message}</div>}
          {rows.map((row) => (
            <article key={row.id} className="hgn-card p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-hgnBlue">{row.status}</div>
                  <h2 className="mt-1 text-2xl font-black text-hgnNavy">{row.customer_name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{row.customer_email || "No email"} · {money(row.amount_cents)}</p>
                  {row.description && <p className="mt-3 text-slate-700">{row.description}</p>}
                  {row.square_checkout_url && <a href={row.square_checkout_url} target="_blank" className="mt-3 inline-flex font-black text-hgnBlue underline">Open Square checkout link</a>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => markStatus(row.id, "sent")} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-black text-hgnNavy">Sent</button>
                  <button onClick={() => markStatus(row.id, "paid")} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-black text-white">Paid</button>
                  <button onClick={() => markStatus(row.id, "cancelled")} className="rounded-lg bg-hgnBlue px-3 py-2 text-sm font-black text-white">Cancel</button>
                </div>
              </div>
            </article>
          ))}
          {!rows.length && <div className="hgn-card p-8 text-slate-600">No invoices yet.</div>}
        </section>
      </div>
    </main>
  );
}
