"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Integration={provider:string;enabled:boolean;connection_status:string;last_sync_at:string|null;last_sync_status:string|null;last_sync_message:string|null};
type BackfillTotals={payments:number;invoices:number;orders:number;customers:number};

function monthsBetween(start:string,end:string){
  const result:string[]=[]; const d=new Date(`${start.slice(0,7)}-01T00:00:00Z`); const last=new Date(`${end.slice(0,7)}-01T00:00:00Z`);
  while(d<=last){result.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`);d.setUTCMonth(d.getUTCMonth()+1)} return result;
}

export default function IntegrationsPage(){
 const[rows,setRows]=useState<Integration[]>([]),[message,setMessage]=useState(""),[busy,setBusy]=useState(false),[backfillBusy,setBackfillBusy]=useState(false);
 const[startDate,setStartDate]=useState("2024-01-01"),[endDate,setEndDate]=useState(()=>new Date().toISOString().slice(0,10)),[progress,setProgress]=useState(""),[totals,setTotals]=useState<BackfillTotals>({payments:0,invoices:0,orders:0,customers:0});
 async function load(){const r=await supabase.from("hgn_integrations").select("*").order("provider");if(r.error)setMessage(r.error.message);else setRows((r.data||[]) as Integration[])}
 useEffect(()=>{void load()},[]);
 async function authToken(){const s=await supabase.auth.getSession();return s.data.session?.access_token||""}
 async function syncSquare(){setBusy(true);setMessage("Checking Square and importing recent payments...");const token=await authToken();if(!token){setMessage("Sign in again before syncing Square.");setBusy(false);return}const r=await fetch("/api/integrations/square/sync",{method:"POST",headers:{Authorization:`Bearer ${token}`}});const j=await r.json().catch(()=>({}));setMessage(r.ok?`Square sync complete: ${j.imported||0} payments checked.`:(j.error||"Square sync failed."));setBusy(false);void load()}
 async function fullBackfill(){
   if(!startDate||!endDate||startDate>endDate){setMessage("Choose a valid historical date range.");return}
   const token=await authToken();if(!token){setMessage("Sign in again before importing Square history.");return}
   const months=monthsBetween(startDate,endDate);setBackfillBusy(true);setMessage("");setTotals({payments:0,invoices:0,orders:0,customers:0});
   let running={payments:0,invoices:0,orders:0,customers:0};
   for(let i=0;i<months.length;i++){
     const period=months[i];setProgress(`Importing ${period} · ${i+1} of ${months.length}`);
     const r=await fetch("/api/integrations/square/backfill",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({startDate,endDate,period})});
     const j=await r.json().catch(()=>({}));
     if(!r.ok){setMessage(`Square history stopped at ${period}: ${j.error||"Unknown error"}. Start it again to safely resume; duplicates are blocked.`);setBackfillBusy(false);return}
     running={payments:running.payments+Number(j.payments||0),invoices:running.invoices+Number(j.invoices||0),orders:running.orders+Number(j.orders||0),customers:Math.max(running.customers,Number(j.customers||0))};setTotals(running);
   }
   setProgress("");setMessage(`Full Square history complete: ${running.payments} payments, ${running.invoices} invoices, ${running.orders} orders and ${running.customers} customer profiles checked.`);setBackfillBusy(false);void load();
 }
 const squareRow=useMemo(()=>rows.find(x=>x.provider==="square"),[rows]);
 return <main className="mx-auto max-w-6xl space-y-7 px-6 py-10"><header className="rounded-3xl border bg-white p-8"><p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Connected services</p><h1 className="mt-2 font-serif text-5xl font-bold">Integrations</h1><p className="mt-3 max-w-3xl text-slate-600">Keep recent payments current, or build the complete Square archive by importing payments, invoices, itemized orders and customer profiles month by month.</p><Link href="/admin/operations" className="mt-5 inline-block font-bold text-hgnBlue">← Back to Operations</Link></header>{message&&<p className="rounded-xl border bg-white p-4 font-bold">{message}</p>}
 <section className="rounded-3xl border bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-serif text-3xl font-bold">Square</h2><p className="mt-2 text-slate-600">Live synchronization and complete historical backfill.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black">{squareRow?.connection_status?.replaceAll("_"," ")||"not configured"}</span></div><div className="mt-4 text-sm text-slate-500">Last sync: {squareRow?.last_sync_at?new Date(squareRow.last_sync_at).toLocaleString():"Never"}{squareRow?.last_sync_message?` · ${squareRow.last_sync_message}`:""}</div><button disabled={busy||backfillBusy} onClick={()=>void syncSquare()} className="hgn-btn-primary mt-5">{busy?"Syncing...":"Sync recent Square activity"}</button></section>
 <section className="rounded-3xl border bg-white p-6"><p className="text-xs font-black uppercase tracking-widest text-hgnBlue">One-time historical import</p><h2 className="mt-2 font-serif text-3xl font-bold">Full Square History</h2><p className="mt-2 max-w-3xl text-slate-600">Choose the first day HGN used Square. The importer moves month by month, follows Square pagination, and safely updates matching Square IDs instead of making duplicates.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="grid gap-1 font-bold">History begins<input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} disabled={backfillBusy}/></label><label className="grid gap-1 font-bold">Import through<input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} disabled={backfillBusy}/></label></div><div className="mt-5 flex flex-wrap items-center gap-4"><button disabled={backfillBusy||busy} onClick={()=>void fullBackfill()} className="hgn-btn-primary">{backfillBusy?"Importing history...":"Import full Square history"}</button>{progress&&<strong>{progress}</strong>}</div><div className="mt-5 grid gap-3 sm:grid-cols-4">{Object.entries(totals).map(([label,value])=><div key={label} className="rounded-2xl bg-slate-50 p-4"><span className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</span><strong className="mt-1 block text-2xl">{value}</strong></div>)}</div><p className="mt-4 text-sm text-slate-500">This may take several minutes. Keep this tab open. If a month fails, running it again is safe.</p></section>
 <section className="grid gap-5 sm:grid-cols-2">{["paypal","patreon"].map(provider=>{const row=rows.find(x=>x.provider===provider);return <article key={provider} className="rounded-3xl border bg-white p-6"><div className="flex justify-between gap-4"><div><h2 className="font-serif text-3xl font-bold capitalize">{provider}</h2><p className="mt-2 text-slate-600">Historical CSV import is available now.</p></div><span className="h-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-black">{row?.connection_status?.replaceAll("_"," ")||"not configured"}</span></div><Link href="/admin/billing/history" className="mt-5 inline-block font-bold text-hgnBlue">Import {provider} CSV →</Link></article>})}</section></main>
}
