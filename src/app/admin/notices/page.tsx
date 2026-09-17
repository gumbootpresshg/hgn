"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Archive, Eye, FileText, Image as ImageIcon, Plus, Save, Search, Trash2, Upload } from "lucide-react"
import { supabase } from "@/lib/supabase"

type Notice = {
  id: string
  title?: string | null
  body?: string | null
  message?: string | null
  type?: string | null
  category?: string | null
  town?: string | null
  organization?: string | null
  starts_at?: string | null
  expires_at?: string | null
  link_url?: string | null
  attachment_url?: string | null
  featured?: boolean | null
  status?: string | null
  published_at?: string | null
  created_at?: string | null
}

const types = ["Community", "Public Notice", "Government", "Road / Transportation", "Service Interruption", "Meeting", "School", "Emergency", "Business", "Other"]
const towns = ["Haida Gwaii", "Masset", "Old Massett", "Port Clements", "Tlell", "Skidegate", "Daajing Giids", "Sandspit", "Moresby Island", "Other"]
const empty: Notice = { id: "new", title: "", body: "", type: "Community", category: "Community", town: "Haida Gwaii", organization: "", starts_at: "", expires_at: "", link_url: "", attachment_url: "", featured: false, status: "draft" }

async function authHeaders(): Promise<Record<string,string>> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}
}
function inputDate(value?: string | null) { return value ? new Date(value).toISOString().slice(0,16) : "" }

export default function NoticesAdminPage() {
  const [items,setItems]=useState<Notice[]>([])
  const [selected,setSelected]=useState<Notice>({...empty})
  const [filter,setFilter]=useState("active")
  const [q,setQ]=useState("")
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState("")
  const [uploading,setUploading]=useState(false)
  const [uploadProgress,setUploadProgress]=useState(0)

  async function load(){
    const r=await fetch("/api/admin/notices",{headers:await authHeaders(),cache:"no-store"})
    const j=await r.json()
    if(r.ok)setItems(j.notices||[]); else setMessage(j.error||"Could not load notices.")
  }
  useEffect(()=>{void load()},[])

  const visible=useMemo(()=>items.filter(n=>{
    if(filter==="published" && n.status!=="published")return false
    if(filter==="draft" && !["draft","pending"].includes(String(n.status)))return false
    if(filter==="archived" && n.status!=="archived")return false
    if(filter==="active" && n.status==="archived")return false
    const hay=`${n.title||""} ${n.organization||""} ${n.town||""} ${n.type||n.category||""}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  }),[items,filter,q])

  function edit(n:Notice){setSelected({...n,starts_at:inputDate(n.starts_at),expires_at:inputDate(n.expires_at)});setMessage("")}
  async function save(status?:string){
    setBusy(true);setMessage("")
    const payload={...selected,status:status||selected.status}
    const creating=selected.id==="new"
    const url=creating?"/api/admin/notices":`/api/admin/notices/${selected.id}`
    const r=await fetch(url,{method:creating?"POST":"PUT",headers:{...(await authHeaders()),"Content-Type":"application/json"},body:JSON.stringify(payload)})
    const j=await r.json().catch(()=>({}))
    if(r.ok){setMessage(creating?"Notice created.":"Notice saved.");await load();setSelected({...empty})}else setMessage(j.error||"Could not save notice.")
    setBusy(false)
  }
  async function uploadAttachment(file: File) {
    if (!file || !file.size) return
    setUploading(true)
    setUploadProgress(10)
    setMessage("")
    try {
      const prep = await fetch("/api/admin/notices/upload-url", {
        method: "POST",
        headers: { ...(await authHeaders()), "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      })
      const prepared = await prep.json().catch(() => ({}))
      if (!prep.ok) throw new Error(prepared.error || "Could not prepare notice upload.")
      setUploadProgress(35)
      const { error } = await supabase.storage
        .from(prepared.bucket)
        .uploadToSignedUrl(prepared.path, prepared.token, file, { contentType: file.type || undefined, upsert: false })
      if (error) throw new Error(error.message)
      setUploadProgress(90)
      setSelected((current) => ({ ...current, attachment_url: String(prepared.publicUrl || "") }))
      setUploadProgress(100)
      setMessage("Notice attachment uploaded. Save or publish the notice to keep it attached.")
    } catch (error: any) {
      setMessage(error?.message || "Could not upload notice attachment.")
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  async function remove(n:Notice){
    if(!confirm(`Delete “${n.title||"this notice"}”? This cannot be undone.`))return
    const r=await fetch(`/api/admin/notices/${n.id}`,{method:"DELETE",headers:await authHeaders()})
    if(r.ok){await load();if(selected.id===n.id)setSelected({...empty});setMessage("Notice deleted.")}
  }

  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
    <section className="rounded-3xl border bg-white p-7 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[.18em] text-hgnBlue">Community</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-serif text-5xl font-bold">Notices</h1><p className="mt-2 max-w-3xl text-slate-600">Create, publish, archive and manage community and public notices without going through the reader-submission queue.</p></div><Link href="/notices" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black"><Eye size={16}/>View public notices</Link></div>
    </section>

    {message&&<div className="rounded-2xl border bg-white p-4 font-bold">{message}</div>}

    <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2"><button onClick={()=>setSelected({...empty})} className="hgn-btn-primary inline-flex items-center gap-2"><Plus size={16}/>Add Notice</button><div className="relative min-w-[180px] flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search notices" className="w-full rounded-xl border py-2.5 pl-9 pr-3"/></div></div>
        <div className="mt-4 flex flex-wrap gap-2">{["active","published","draft","archived","all"].map(x=><button key={x} onClick={()=>setFilter(x)} className={`rounded-full px-3 py-1.5 text-xs font-black capitalize ${filter===x?"bg-hgnNavy text-white":"border bg-white"}`}>{x}</button>)}</div>
        <div className="mt-4 space-y-2">{visible.map(n=><button key={n.id} onClick={()=>edit(n)} className={`w-full rounded-2xl border p-4 text-left transition hover:border-hgnBlue hover:shadow-sm ${selected.id===n.id?"border-hgnBlue ring-2 ring-blue-100":""}`}><div className="flex items-start justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-wide text-hgnBlue">{n.type||n.category||"Notice"} · {n.status||"draft"}</div><div className="mt-1 text-lg font-black text-slate-950">{n.title||"Untitled"}</div><div className="mt-1 text-xs text-slate-500">{n.organization||n.town||"Haida Gwaii"}</div></div>{n.featured&&<span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-900">FEATURED</span>}</div></button>)}{!visible.length&&<div className="rounded-2xl border border-dashed p-6 text-sm text-slate-500">No notices in this view.</div>}</div>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-hgnBlue">{selected.id==="new"?"New notice":"Edit notice"}</p><h2 className="mt-1 text-3xl font-black">{selected.title||"Untitled Notice"}</h2></div>{selected.id!=="new"&&<button onClick={()=>void remove(selected)} className="rounded-full border border-red-200 p-2 text-red-700 hover:bg-red-50" title="Delete"><Trash2 size={18}/></button>}</div>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-1 text-sm font-bold">Title<input value={selected.title||""} onChange={e=>setSelected(x=>({...x,title:e.target.value}))} className="rounded-xl border px-3 py-2.5"/></label>
          <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-1 text-sm font-bold">Notice type<select value={selected.type||selected.category||"Community"} onChange={e=>setSelected(x=>({...x,type:e.target.value,category:e.target.value}))} className="rounded-xl border px-3 py-2.5">{types.map(t=><option key={t}>{t}</option>)}</select></label><label className="grid gap-1 text-sm font-bold">Town / Area<select value={selected.town||"Haida Gwaii"} onChange={e=>setSelected(x=>({...x,town:e.target.value}))} className="rounded-xl border px-3 py-2.5">{towns.map(t=><option key={t}>{t}</option>)}</select></label></div>
          <label className="grid gap-1 text-sm font-bold">Organization / source<input value={selected.organization||""} onChange={e=>setSelected(x=>({...x,organization:e.target.value}))} placeholder="Village, school, business, organization..." className="rounded-xl border px-3 py-2.5"/></label>
          <label className="grid gap-1 text-sm font-bold">Notice text<textarea rows={8} value={selected.body||selected.message||""} onChange={e=>setSelected(x=>({...x,body:e.target.value,message:e.target.value}))} className="rounded-xl border px-3 py-2.5"/></label>
          <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-1 text-sm font-bold">Starts<input type="datetime-local" value={selected.starts_at||""} onChange={e=>setSelected(x=>({...x,starts_at:e.target.value}))} className="rounded-xl border px-3 py-2.5"/></label><label className="grid gap-1 text-sm font-bold">Expires<input type="datetime-local" value={selected.expires_at||""} onChange={e=>setSelected(x=>({...x,expires_at:e.target.value}))} className="rounded-xl border px-3 py-2.5"/></label></div>
          <label className="grid gap-1 text-sm font-bold">Link<input value={selected.link_url||""} onChange={e=>setSelected(x=>({...x,link_url:e.target.value}))} placeholder="https://..." className="rounded-xl border px-3 py-2.5"/></label>
          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-black"><Upload size={16}/> Upload notice file</div>
            <p className="mt-1 text-xs text-slate-500">Upload a PDF, JPG, PNG, WebP or GIF directly from your computer. PDFs can be up to 40 MB and images up to 20 MB.</p>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading}
              onChange={e=>{const file=e.target.files?.[0];if(file)void uploadAttachment(file);e.currentTarget.value=""}}
              className="mt-3 block w-full rounded-xl border bg-white px-3 py-2.5 text-sm"
            />
            {uploading&&<div className="mt-3"><div className="flex justify-between text-xs font-bold"><span>Uploading…</span><span>{uploadProgress}%</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-hgnNavy transition-all" style={{width:`${uploadProgress}%`}}/></div></div>}
            {selected.attachment_url&&<div className="mt-3 rounded-xl border bg-white p-3 text-sm"><div className="flex items-center gap-2 font-bold">{selected.attachment_url.toLowerCase().includes('.pdf')?<FileText size={16}/>:<ImageIcon size={16}/>} Attachment ready</div><div className="mt-2 flex flex-wrap gap-2"><a href={selected.attachment_url} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-1.5 text-xs font-black">Preview</a><button type="button" onClick={()=>setSelected(x=>({...x,attachment_url:""}))} className="rounded-full border px-3 py-1.5 text-xs font-black text-red-700">Remove</button></div></div>}
          </div>
          <label className="grid gap-1 text-sm font-bold">Or paste an attachment URL<input value={selected.attachment_url||""} onChange={e=>setSelected(x=>({...x,attachment_url:e.target.value}))} placeholder="Optional external image or PDF URL" className="rounded-xl border px-3 py-2.5"/></label>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={!!selected.featured} onChange={e=>setSelected(x=>({...x,featured:e.target.checked}))}/> Feature / mark important</label>
          <div className="flex flex-wrap gap-2 border-t pt-4"><button disabled={busy} onClick={()=>void save("draft")} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-black"><Save size={16}/>Save Draft</button><button disabled={busy} onClick={()=>void save("published")} className="hgn-btn-primary">{busy?"Saving…":"Publish"}</button>{selected.id!=="new"&&<button disabled={busy} onClick={()=>void save("archived")} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-black"><Archive size={16}/>Archive</button>}</div>
        </div>
      </section>
    </div>
  </main>
}
