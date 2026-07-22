"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { CheckCircle2, Clock3, ExternalLink, Search, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

type DeskItem = {
  id:string; title:string; summary:string|null; item_type:string; status:string; priority:string;
  source_name:string|null; source_url:string|null; proposed_action:string|null; confidence:number|null;
  agent_name:string|null; created_at:string; updated_at?:string; payload:Record<string,unknown>|null;
  assigned_to:string|null; due_at:string|null; verification_status:string; related_record_type:string|null;
  related_record_id:string|null; related_record_url:string|null; completed_action:string|null; last_action_at:string|null; reviewed_at:string|null; reviewed_by:string|null;
}
type Profile={user_id:string;display_name:string|null;full_name:string|null;account_type:string|null;admin_role:string|null}
type Comment={id:string;item_id:string;body:string;created_at:string;created_by:string|null}
type Activity={id:string;item_id:string;action:string;detail:string|null;created_at:string}

const statuses=["pending","approved","completed","rejected"]
const types=["all","news_lead","event","guide_update","site_check","sales_lead","renewal","billing_followup"]
const destination:Record<string,string>={news_lead:"Article draft",event:"Event draft",guide_update:"Guide Keeper",site_check:"Platform review",sales_lead:"Sales Desk",renewal:"Sales Desk",billing_followup:"Billing Queue"}
const destinationHref:Record<string,string>={guide_update:"/admin/guide-keeper",site_check:"/admin/platform-map",sales_lead:"/admin/sales",renewal:"/admin/sales",billing_followup:"/admin/billing"}

function slugify(value:string){return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function pretty(value:string){return value.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}
function profileName(p:Profile){return p.display_name||p.full_name||p.admin_role||p.account_type||"Staff member"}
function duplicateKey(item:DeskItem){return `${item.item_type}:${item.title.toLowerCase().replace(/[^a-z0-9]/g,"")}`}

export default function AiDeskPage(){
  const[items,setItems]=useState<DeskItem[]>([]),[profiles,setProfiles]=useState<Profile[]>([]),[comments,setComments]=useState<Comment[]>([]),[activity,setActivity]=useState<Activity[]>([])
  const[status,setStatus]=useState("pending"),[type,setType]=useState("all"),[query,setQuery]=useState(""),[message,setMessage]=useState(""),[loading,setLoading]=useState(true)
  const[selected,setSelected]=useState<string|null>(null),[showAdd,setShowAdd]=useState(false),[busy,setBusy]=useState(""),[mine,setMine]=useState(false),[userId,setUserId]=useState<string|null>(null)

  async function load(){
    setLoading(true);setMessage("")
    const session=await supabase.auth.getSession();const uid=session.data.session?.user.id||null;setUserId(uid)
    const [desk,staff,notes,history]=await Promise.all([
      supabase.from("ai_desk_items").select("*").order("created_at",{ascending:false}).limit(500),
      supabase.from("hgn_profiles").select("user_id,display_name,full_name,account_type,admin_role").in("account_type",["admin","publisher","editor"]),
      supabase.from("ai_desk_comments").select("*").order("created_at",{ascending:true}).limit(1000),
      supabase.from("ai_desk_activity").select("*").order("created_at",{ascending:false}).limit(1500),
    ])
    if(desk.error){setMessage(desk.error.message);setLoading(false);return}
    setItems((desk.data||[]) as DeskItem[]);setProfiles((staff.data||[]) as Profile[]);setComments((notes.data||[]) as Comment[]);setActivity((history.data||[]) as Activity[]);setLoading(false)
  }
  useEffect(()=>{void load()},[])

  const duplicateCounts=useMemo(()=>{const m=new Map<string,number>();items.forEach(i=>m.set(duplicateKey(i),(m.get(duplicateKey(i))||0)+1));return m},[items])
  const shown=useMemo(()=>items.filter(i=>(status==="all"||i.status===status)&&(type==="all"||i.item_type===type)&&(!mine||i.assigned_to===userId)&&(!query.trim()||[i.title,i.summary,i.source_name,i.proposed_action].join(" ").toLowerCase().includes(query.toLowerCase()))),[items,status,type,mine,userId,query])
  const counts=useMemo(()=>Object.fromEntries(statuses.map(s=>[s,items.filter(i=>i.status===s).length])),[items])
  const current=items.find(i=>i.id===selected)||null
  const currentComments=current?comments.filter(c=>c.item_id===current.id):[]
  const currentActivity=current?activity.filter(a=>a.item_id===current.id).slice(0,12):[]

  async function log(itemId:string,action:string,detail?:string){await supabase.from("ai_desk_activity").insert({item_id:itemId,action,detail:detail||null,actor_id:userId})}
  async function patch(item:DeskItem,values:Partial<DeskItem>,action:string,detail?:string){
    setBusy(item.id);const update={...values,updated_at:new Date().toISOString()};const{error}=await supabase.from("ai_desk_items").update(update).eq("id",item.id)
    if(error)setMessage(error.message);else{await log(item.id,action,detail);await load()}setBusy("")
  }
  async function add(e:FormEvent<HTMLFormElement>){
    e.preventDefault();const f=new FormData(e.currentTarget);const confidence=String(f.get("confidence")||"")
    const{error}=await supabase.from("ai_desk_items").insert({title:f.get("title"),item_type:f.get("item_type"),priority:f.get("priority"),summary:f.get("summary")||null,proposed_action:f.get("proposed_action")||null,source_name:f.get("source_name")||null,source_url:f.get("source_url")||null,agent_name:"Manual desk note",confidence:confidence?Number(confidence)/100:null,verification_status:"unverified"})
    if(error)setMessage(error.message);else{e.currentTarget.reset();setShowAdd(false);await load()}
  }
  async function addComment(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(!current)return;const f=new FormData(e.currentTarget);const body=String(f.get("body")||"").trim();if(!body)return
    const{error}=await supabase.from("ai_desk_comments").insert({item_id:current.id,body,created_by:userId});if(error)setMessage(error.message);else{await log(current.id,"comment_added");e.currentTarget.reset();await load()}
  }
  async function createArticle(item:DeskItem){
    setBusy(item.id);const now=new Date().toISOString();const slug=`${slugify(item.title)||"desk-draft"}-${Date.now().toString().slice(-6)}`
    const body=[item.summary||"",item.proposed_action?`\n\nEDITOR NOTE\n${item.proposed_action}`:"",item.source_url?`\n\nSOURCE\n${item.source_name||"Original source"}: ${item.source_url}`:""].join("")
    const{data,error}=await supabase.from("articles").insert({title:item.title,slug,section:"News",category:"News",status:"draft",body,excerpt:item.summary||"",author_name:"Haida Gwaii News",author:"Haida Gwaii News",created_at:now,updated_at:now}).select("id").single()
    if(error)setMessage(error.message);else{const url=`/admin/articles/${data.id}`;await supabase.from("ai_desk_items").update({status:"completed",related_record_type:"article",related_record_id:data.id,related_record_url:url,completed_action:"article_draft_created",last_action_at:now,reviewed_at:now,reviewed_by:userId}).eq("id",item.id);await log(item.id,"article_draft_created",url);await load();setSelected(item.id)}setBusy("")
  }
  async function createEvent(item:DeskItem){
    setBusy(item.id);const p=(item.payload||{}) as Record<string,any>;const start=p.start_date||p.event_date||new Date().toISOString().slice(0,10)
    const{data,error}=await supabase.from("event_submissions").insert({title:item.title,description:item.summary||item.proposed_action||"",event_date:start,start_date:start,end_date:p.end_date||start,start_time:p.start_time||null,end_time:p.end_time||null,is_all_day:Boolean(p.is_all_day),location:p.location||null,community:p.community||null,status:"pending",admin_notes:`Created from AI Desk item ${item.id}. Verify all details before approval.`,updated_at:new Date().toISOString()}).select("id").single()
    if(error)setMessage(error.message);else{const url=`/admin/events/${data.id}`;await supabase.from("ai_desk_items").update({status:"completed",related_record_type:"event_submission",related_record_id:data.id,related_record_url:url,completed_action:"event_draft_created",last_action_at:new Date().toISOString(),reviewed_at:new Date().toISOString(),reviewed_by:userId}).eq("id",item.id);await log(item.id,"event_draft_created",url);await load();setSelected(item.id)}setBusy("")
  }
  async function controlledAction(item:DeskItem){if(item.item_type==="news_lead")return createArticle(item);if(item.item_type==="event")return createEvent(item);const href=destinationHref[item.item_type];if(href)await patch(item,{status:"approved",related_record_url:href,last_action_at:new Date().toISOString()},"routed_to_workflow",href)}

  return <main className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6">
    <header className="rounded-3xl border bg-slate-950 p-7 text-white shadow-sm sm:p-9">
      <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[.2em] text-blue-300">Human-controlled newsroom assistant</p><h1 className="mt-2 font-serif text-5xl font-bold">AI Desk</h1><p className="mt-3 max-w-3xl text-slate-300">Review leads, verify sources, assign work and turn approved items into real drafts. Nothing publishes, sends or contacts anyone automatically.</p></div><div className="flex flex-wrap gap-2"><Link href="/admin/ai-desk/connections" className="rounded-full border border-slate-600 px-4 py-2 text-sm font-black">Connection audit</Link><button onClick={()=>setShowAdd(v=>!v)} className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950">{showAdd?"Close form":"Add item"}</button></div></div>
    </header>
    {message&&<p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 font-bold text-amber-900">{message}</p>}
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{statuses.map(s=><button key={s} onClick={()=>setStatus(s)} className={`rounded-2xl border p-5 text-left shadow-sm ${status===s?"border-hgnBlue bg-blue-50":"bg-white"}`}><span className="text-xs font-black uppercase tracking-widest text-slate-500">{s}</span><strong className="mt-2 block text-3xl">{counts[s]||0}</strong></button>)}</section>
    <section className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto_auto]">
      <label className="flex items-center gap-2 rounded-xl border px-3"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search title, source or notes" className="min-w-0 flex-1 py-3 outline-none"/></label>
      <select value={type} onChange={e=>setType(e.target.value)} className="rounded-xl border px-3 py-3 font-bold">{types.map(t=><option key={t} value={t}>{pretty(t)}</option>)}</select>
      <button onClick={()=>setMine(v=>!v)} className={`rounded-xl border px-4 py-3 font-black ${mine?"bg-slate-950 text-white":""}`}>Assigned to me</button>
    </section>
    {showAdd&&<form onSubmit={add} className="grid gap-3 rounded-3xl border bg-white p-6 shadow-sm"><h2 className="font-serif text-3xl font-bold">Add desk item</h2><div className="grid gap-3 md:grid-cols-3"><select name="item_type" defaultValue="news_lead">{types.filter(t=>t!=="all").map(t=><option key={t}>{t}</option>)}</select><select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select><input name="confidence" type="number" min="0" max="100" placeholder="Confidence %"/></div><input name="title" required placeholder="Clear headline or task"/><textarea name="summary" rows={4} placeholder="What was found and why it matters"/><textarea name="proposed_action" rows={3} placeholder="Recommended next action"/><div className="grid gap-3 md:grid-cols-2"><input name="source_name" placeholder="Source name"/><input name="source_url" type="url" placeholder="Source URL"/></div><button className="hgn-btn-primary">Save for review</button></form>}
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="grid content-start gap-4">{loading?<p className="rounded-2xl border bg-white p-6">Loading AI Desk…</p>:shown.length===0?<p className="rounded-2xl border border-dashed bg-white p-10 text-center text-slate-500">No items in this view.</p>:shown.map(item=>{
        const duplicate=(duplicateCounts.get(duplicateKey(item))||0)>1;const overdue=item.due_at&&new Date(item.due_at)<new Date()&&item.status!=="completed";const assignee=profiles.find(p=>p.user_id===item.assigned_to)
        return <article key={item.id} onClick={()=>setSelected(item.id)} className={`cursor-pointer rounded-3xl border bg-white p-6 shadow-sm transition hover:border-hgnBlue ${selected===item.id?"ring-2 ring-hgnBlue":""}`}><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-widest text-hgnBlue">{pretty(item.item_type)} · {item.priority}</p><h2 className="mt-2 font-serif text-3xl font-bold">{item.title}</h2></div><span className="rounded-full border px-3 py-1 text-xs font-black uppercase">{item.status}</span></div>{item.summary&&<p className="mt-3 line-clamp-3 leading-7 text-slate-700">{item.summary}</p>}<div className="mt-4 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-slate-100 px-3 py-1">{pretty(item.verification_status||"unverified")}</span><span className="rounded-full bg-slate-100 px-3 py-1">{assignee?`Assigned: ${profileName(assignee)}`:"Unassigned"}</span>{overdue&&<span className="rounded-full bg-red-100 px-3 py-1 text-red-800">Overdue</span>}{duplicate&&<span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">Possible duplicate</span>}</div></article>})}</div>
      <aside className="xl:sticky xl:top-24 xl:self-start">{!current?<div className="rounded-3xl border border-dashed bg-white p-8 text-center text-slate-500">Choose an item to review, assign and route it.</div>:<div className="space-y-5 rounded-3xl border bg-white p-6 shadow-sm"><div><p className="text-xs font-black uppercase tracking-widest text-hgnBlue">{pretty(current.item_type)}</p><h2 className="mt-2 font-serif text-3xl font-bold">{current.title}</h2></div>{current.summary&&<p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{current.summary}</p>}{current.proposed_action&&<div className="rounded-2xl bg-slate-50 p-4"><strong>Suggested next step</strong><p className="mt-1 text-sm leading-6">{current.proposed_action}</p></div>}
        <div className="grid gap-3"><label className="grid gap-1 text-sm font-black">Assign to<select value={current.assigned_to||""} onChange={e=>void patch(current,{assigned_to:e.target.value||null},"assignment_changed",e.target.value)}><option value="">Unassigned</option>{profiles.map(p=><option key={p.user_id} value={p.user_id}>{profileName(p)}</option>)}</select></label><label className="grid gap-1 text-sm font-black">Due date<input type="date" value={current.due_at?.slice(0,10)||""} onChange={e=>void patch(current,{due_at:e.target.value?new Date(`${e.target.value}T23:59:00`).toISOString():null},"due_date_changed",e.target.value)}/></label><label className="grid gap-1 text-sm font-black">Source check<select value={current.verification_status||"unverified"} onChange={e=>void patch(current,{verification_status:e.target.value},"verification_changed",e.target.value)}><option value="unverified">Unverified</option><option value="needs_check">Needs check</option><option value="verified">Verified</option><option value="disputed">Disputed</option></select></label></div>
        <div className="flex flex-wrap gap-2">{current.source_url&&<a href={current.source_url} target="_blank" rel="noreferrer" className="rounded-full border px-4 py-2 text-sm font-black">Open source <ExternalLink className="inline" size={14}/></a>}{current.related_record_url&&<Link href={current.related_record_url} className="rounded-full border px-4 py-2 text-sm font-black">Open created record</Link>}</div>
        <div className="grid gap-2"><button disabled={busy===current.id} onClick={()=>void controlledAction(current)} className="hgn-btn-primary">{current.item_type==="news_lead"?"Create article draft":current.item_type==="event"?"Create event draft":`Route to ${destination[current.item_type]||"workflow"}`}</button><div className="grid grid-cols-2 gap-2"><button onClick={()=>void patch(current,{status:"approved",reviewed_at:new Date().toISOString(),reviewed_by:userId},"approved")} className="rounded-full border px-3 py-2 text-sm font-black"><CheckCircle2 className="mr-1 inline" size={15}/>Approve</button><button onClick={()=>void patch(current,{status:"rejected"},"rejected")} className="rounded-full border px-3 py-2 text-sm font-black"><XCircle className="mr-1 inline" size={15}/>Reject</button></div><button onClick={()=>void patch(current,{status:"pending"},"returned_to_pending")} className="rounded-full border px-3 py-2 text-sm font-black"><Clock3 className="mr-1 inline" size={15}/>Return to pending</button></div>
        <form onSubmit={addComment} className="grid gap-2 border-t pt-4"><strong>Internal notes</strong><textarea name="body" rows={3} required placeholder="Add a newsroom note"/><button className="rounded-full border px-4 py-2 text-sm font-black">Add note</button></form>{currentComments.length>0&&<div className="space-y-2">{currentComments.map(c=><p key={c.id} className="rounded-xl bg-slate-50 p-3 text-sm"><span className="block text-xs text-slate-500">{new Date(c.created_at).toLocaleString()}</span>{c.body}</p>)}</div>}
        {currentActivity.length>0&&<details className="border-t pt-4"><summary className="cursor-pointer font-black">Activity history</summary><div className="mt-3 space-y-2">{currentActivity.map(a=><p key={a.id} className="text-xs text-slate-600"><strong>{pretty(a.action)}</strong>{a.detail?` · ${a.detail}`:""}<span className="block text-slate-400">{new Date(a.created_at).toLocaleString()}</span></p>)}</div></details>}
      </div>}</aside>
    </section>
  </main>
}
