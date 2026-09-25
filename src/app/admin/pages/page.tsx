"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { FileText, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { publicPageRoute } from "@/lib/cms/system-pages"

async function headers(): Promise<Record<string,string>> { const { data } = await supabase.auth.getSession(); return data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {} }

export default function PagesAdmin(){
  const [pages,setPages]=useState<any[]>([]); const [msg,setMsg]=useState("")
  useEffect(()=>{ void (async()=>{ const r=await fetch('/api/admin/site-pages',{headers:await headers(),cache:'no-store'}); const j=await r.json(); if(r.ok)setPages(j.pages||[]); else setMsg(j.error||'Could not load pages.') })() },[])
  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
    <section className="rounded-3xl border bg-white p-8 shadow-sm"><p className="text-sm font-black uppercase tracking-[.18em] text-hgnBlue">Publisher CMS</p><div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-serif text-5xl font-bold">Pages</h1><p className="mt-3 max-w-3xl text-slate-600">Edit HGN’s public information pages, including Support, Contact and Advertising, or create new pages without touching code. New pages can be linked from Site Configuration.</p></div><Link href="/admin/pages/new" className="hgn-btn-primary inline-flex items-center gap-2"><Plus size={18}/>New page</Link></div></section>
    {msg&&<div className="rounded-2xl border bg-white p-4">{msg}</div>}
    <section className="grid gap-3 md:grid-cols-2">{pages.map(p=><Link key={p.id} href={`/admin/pages/${p.id}`} className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-hgnBlue hover:shadow-md"><div className="flex items-start gap-3"><FileText className="mt-1 text-hgnBlue" size={20}/><div><h2 className="text-xl font-black">{p.title}</h2><p className="mt-1 text-sm text-slate-500">{publicPageRoute(p.system_key,p.slug)} · {p.status} · {p.visibility}</p>{p.system_key&&<p className="mt-2 text-xs font-bold uppercase tracking-wide text-amber-700">Built-in public page: {p.system_key.replace(/_/g," ")}</p>}</div></div></Link>)}</section>
  </main>
}
