"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { Archive, CheckCircle2, ExternalLink, Search, ShieldCheck, Trash2, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

type DeskItem = {
  id: string
  title: string
  summary: string | null
  item_type: string
  status: string
  priority: string
  source_name: string | null
  source_url: string | null
  proposed_action: string | null
  confidence: number | null
  agent_name: string | null
  origin?: string | null
  created_at: string
  updated_at?: string
  payload: Record<string, any> | null
  assigned_to: string | null
  due_at: string | null
  verification_status: string
  related_record_type: string | null
  related_record_id: string | null
  related_record_url: string | null
  completed_action: string | null
  last_action_at: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  archived_at?: string | null
}

type Profile = { user_id: string; display_name: string | null; full_name: string | null; account_type: string | null; admin_role: string | null }
type Comment = { id: string; item_id: string; body: string; created_at: string; created_by: string | null }
type Activity = { id: string; item_id: string; action: string; detail: string | null; created_at: string }

const statuses = ["pending", "approved", "completed", "rejected", "archived"]
const types = ["all", "news_lead", "event"]

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }
function pretty(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) }
function profileName(profile: Profile) { return profile.display_name || profile.full_name || profile.admin_role || profile.account_type || "Staff member" }
function confidencePercent(item: DeskItem) { return item.confidence == null ? null : Math.round(item.confidence * 100) }
function originLabel(item: DeskItem) {
  if (item.origin === "ai_event_finder" || item.agent_name === "AI Desk Event Finder") return "AI Event Finder"
  if (item.agent_name === "Manual desk note" || item.origin === "manual") return "Manual"
  return item.agent_name || "AI Research"
}

export default function AiDeskPage() {
  const [items, setItems] = useState<DeskItem[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [activity, setActivity] = useState<Activity[]>([])
  const [status, setStatus] = useState("pending")
  const [type, setType] = useState("all")
  const [query, setQuery] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showAdd, setShowAdd] = useState(false)
  const [busy, setBusy] = useState("")
  const [mine, setMine] = useState(false)
  const [highConfidenceOnly, setHighConfidenceOnly] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setMessage("")
    const session = await supabase.auth.getSession()
    const uid = session.data.session?.user.id || null
    setUserId(uid)

    let queryBuilder = supabase
      .from("ai_desk_items")
      .select("*")
      .in("item_type", ["news_lead", "event"])
      .order("created_at", { ascending: false })
      .limit(150)

    if (status !== "all") queryBuilder = queryBuilder.eq("status", status)

    const [desk, staff] = await Promise.all([
      queryBuilder,
      supabase.from("hgn_profiles").select("user_id,display_name,full_name,account_type,admin_role").in("account_type", ["admin", "publisher", "editor"]),
    ])

    if (desk.error) {
      setMessage(desk.error.message)
      setLoading(false)
      return
    }

    setItems((desk.data || []) as DeskItem[])
    setProfiles((staff.data || []) as Profile[])
    setLoading(false)
  }

  useEffect(() => { void load() }, [status])

  async function loadDetails(itemId: string) {
    const [notes, history] = await Promise.all([
      supabase.from("ai_desk_comments").select("*").eq("item_id", itemId).order("created_at", { ascending: true }).limit(100),
      supabase.from("ai_desk_activity").select("*").eq("item_id", itemId).order("created_at", { ascending: false }).limit(50),
    ])
    setComments((notes.data || []) as Comment[])
    setActivity((history.data || []) as Activity[])
  }

  async function selectItem(id: string) {
    setSelected(id)
    await loadDetails(id)
  }

  const shown = useMemo(() => items.filter((item) => {
    if (type !== "all" && item.item_type !== type) return false
    if (mine && item.assigned_to !== userId) return false
    if (highConfidenceOnly && item.confidence != null && item.confidence < .65) return false
    if (query.trim() && ![item.title, item.summary, item.source_name, item.proposed_action].join(" ").toLowerCase().includes(query.toLowerCase())) return false
    return true
  }), [items, type, mine, userId, highConfidenceOnly, query])

  const current = items.find((item) => item.id === selected) || null
  const pendingLowConfidence = items.filter((item) => item.status === "pending" && item.confidence != null && item.confidence < .65)

  async function log(itemId: string, action: string, detail?: string) {
    await supabase.from("ai_desk_activity").insert({ item_id: itemId, action, detail: detail || null, actor_id: userId })
  }

  async function patch(item: DeskItem, values: Partial<DeskItem>, action: string, detail?: string) {
    setBusy(item.id)
    const update = { ...values, updated_at: new Date().toISOString() }
    const { error } = await supabase.from("ai_desk_items").update(update).eq("id", item.id)
    if (error) setMessage(error.message)
    else {
      await log(item.id, action, detail)
      await load()
      if (selected === item.id) await loadDetails(item.id)
    }
    setBusy("")
  }

  async function bulkStatus(nextStatus: "rejected" | "archived") {
    const ids = [...selectedIds]
    if (!ids.length) return
    setBusy("bulk")
    const values: Record<string, unknown> = { status: nextStatus, updated_at: new Date().toISOString() }
    if (nextStatus === "archived") values.archived_at = new Date().toISOString()
    const { error } = await supabase.from("ai_desk_items").update(values).in("id", ids)
    if (error) setMessage(error.message)
    else {
      for (const id of ids) await log(id, nextStatus === "archived" ? "archived" : "rejected")
      setSelectedIds(new Set())
      setMessage(nextStatus === "archived" ? `${ids.length} items archived.` : `${ids.length} items rejected.`)
      await load()
    }
    setBusy("")
  }

  async function rejectLowConfidence() {
    const ids = pendingLowConfidence.map((item) => item.id)
    if (!ids.length) return
    if (!window.confirm(`Reject ${ids.length} low-confidence AI findings? They remain in the Rejected view for audit history.`)) return
    setBusy("low")
    const { error } = await supabase.from("ai_desk_items").update({ status: "rejected", updated_at: new Date().toISOString() }).in("id", ids)
    if (error) setMessage(error.message)
    else {
      setMessage(`${ids.length} low-confidence findings rejected.`)
      await load()
    }
    setBusy("")
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const confidence = String(form.get("confidence") || "")
    const { error } = await supabase.from("ai_desk_items").insert({
      title: form.get("title"),
      item_type: form.get("item_type"),
      priority: form.get("priority"),
      summary: form.get("summary") || null,
      proposed_action: form.get("proposed_action") || null,
      source_name: form.get("source_name") || null,
      source_url: form.get("source_url") || null,
      agent_name: "Manual desk note",
      origin: "manual",
      confidence: confidence ? Number(confidence) / 100 : null,
      verification_status: "unverified",
    })
    if (error) setMessage(error.message)
    else {
      event.currentTarget.reset()
      setShowAdd(false)
      await load()
    }
  }

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!current) return
    const form = new FormData(event.currentTarget)
    const body = String(form.get("body") || "").trim()
    if (!body) return
    const { error } = await supabase.from("ai_desk_comments").insert({ item_id: current.id, body, created_by: userId })
    if (error) setMessage(error.message)
    else {
      await log(current.id, "comment_added")
      event.currentTarget.reset()
      await loadDetails(current.id)
    }
  }

  async function createArticle(item: DeskItem) {
    if (item.verification_status !== "verified") {
      setMessage("Verify the source before promoting this research into an article draft.")
      return
    }
    setBusy(item.id)
    const now = new Date().toISOString()
    const slug = `${slugify(item.title) || "desk-draft"}-${Date.now().toString().slice(-6)}`
    const body = [
      item.summary || "",
      item.proposed_action ? `\n\nEDITOR NOTE\n${item.proposed_action}` : "",
      item.source_url ? `\n\nSOURCE\n${item.source_name || "Original source"}: ${item.source_url}` : "",
    ].join("")
    const { data, error } = await supabase.from("articles").insert({
      title: item.title,
      slug,
      section: "News",
      category: "News",
      status: "draft",
      body,
      excerpt: item.summary || "",
      author_name: "Haida Gwaii News",
      author: "Haida Gwaii News",
      created_at: now,
      updated_at: now,
    }).select("id").single()
    if (error) setMessage(error.message)
    else {
      const url = `/admin/articles/${data.id}`
      await supabase.from("ai_desk_items").update({
        status: "completed",
        related_record_type: "article",
        related_record_id: data.id,
        related_record_url: url,
        completed_action: "article_draft_created",
        last_action_at: now,
        reviewed_at: now,
        reviewed_by: userId,
      }).eq("id", item.id)
      await log(item.id, "article_draft_created", url)
      setMessage("Verified research promoted to an article draft.")
      await load()
    }
    setBusy("")
  }

  async function createEvent(item: DeskItem) {
    const payload = item.payload || {}
    const missing = Array.isArray(payload.missing_fields) ? payload.missing_fields : []
    if (item.verification_status !== "verified") {
      setMessage("Verify the source before promoting this research into an event draft.")
      return
    }
    if (!payload.start_date || !item.source_url) {
      setMessage("A verified date and source link are required before promotion.")
      return
    }

    setBusy(item.id)
    const start = payload.start_date
    const { data, error } = await supabase.from("event_submissions").insert({
      title: item.title,
      description: item.summary || item.proposed_action || "",
      event_date: start,
      start_date: start,
      end_date: payload.end_date || start,
      start_time: payload.start_time || null,
      end_time: payload.end_time || null,
      is_all_day: Boolean(payload.is_all_day),
      location: payload.location || null,
      community: payload.community || null,
      status: "pending",
      admin_notes: `AI Desk research promotion from item ${item.id}. This is staff research, not a public submission. Missing at scan time: ${missing.join(", ") || "none"}. Source: ${item.source_url}`,
      updated_at: new Date().toISOString(),
    }).select("id").single()

    if (error) setMessage(error.message)
    else {
      const url = `/admin/events/${data.id}`
      await supabase.from("ai_desk_items").update({
        status: "completed",
        related_record_type: "event_draft",
        related_record_id: data.id,
        related_record_url: url,
        completed_action: "event_draft_promoted",
        last_action_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
      }).eq("id", item.id)
      await log(item.id, "event_draft_promoted", url)
      setMessage("Verified research promoted to the Event editor. It will not appear as a public submission.")
      await load()
    }
    setBusy("")
  }

  return <main className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6">
    <header className="rounded-3xl border bg-slate-950 p-7 text-white shadow-sm sm:p-9">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-blue-300">Human-controlled newsroom research</p>
          <h1 className="mt-2 font-serif text-5xl font-bold">AI Desk</h1>
          <p className="mt-3 max-w-3xl text-slate-300">AI findings stay here until a person verifies and promotes them. They are research, not reader submissions, and nothing publishes automatically.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/ai-desk/event-finder" className="rounded-full bg-blue-300 px-4 py-2 text-sm font-black text-slate-950">Event Finder</Link>
          <Link href="/admin/ai-desk/connections" className="rounded-full border border-slate-600 px-4 py-2 text-sm font-black">Connections</Link>
          <button onClick={() => setShowAdd((value) => !value)} className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950">{showAdd ? "Close form" : "Add research item"}</button>
        </div>
      </div>
    </header>

    {message && <p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 font-bold text-amber-900">{message}</p>}

    <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {statuses.map((value) => <button key={value} onClick={() => setStatus(value)} className={`rounded-2xl border p-4 text-left shadow-sm ${status === value ? "border-hgnBlue bg-blue-50" : "bg-white"}`}>
        <span className="text-xs font-black uppercase tracking-widest text-slate-500">{pretty(value)}</span>
      </button>)}
    </section>

    <section className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto_auto_auto]">
      <label className="flex items-center gap-2 rounded-xl border px-3"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search research, source or notes" className="min-w-0 flex-1 py-3 outline-none" /></label>
      <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border px-3 py-3 font-bold">{types.map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</select>
      <label className="flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold"><input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} />Assigned to me</label>
      <label className="flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold"><input type="checkbox" checked={highConfidenceOnly} onChange={(e) => setHighConfidenceOnly(e.target.checked)} />65%+ confidence</label>
    </section>

    {status === "pending" && <section className="flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4">
      <strong>{pendingLowConfidence.length} low-confidence findings hidden by default.</strong>
      {pendingLowConfidence.length > 0 && <button disabled={busy === "low"} onClick={() => void rejectLowConfidence()} className="rounded-full border px-4 py-2 text-sm font-black">Reject all low-confidence</button>}
      {selectedIds.size > 0 && <>
        <button disabled={busy === "bulk"} onClick={() => void bulkStatus("archived")} className="rounded-full border px-4 py-2 text-sm font-black"><Archive className="mr-1 inline" size={14} />Archive selected</button>
        <button disabled={busy === "bulk"} onClick={() => void bulkStatus("rejected")} className="rounded-full border px-4 py-2 text-sm font-black"><Trash2 className="mr-1 inline" size={14} />Reject selected</button>
      </>}
    </section>}

    {showAdd && <form onSubmit={add} className="grid gap-3 rounded-3xl border bg-white p-6 md:grid-cols-2">
      <input name="title" required placeholder="Research title" />
      <select name="item_type" defaultValue="news_lead"><option value="news_lead">News lead</option><option value="event">Event research</option></select>
      <select name="priority" defaultValue="normal"><option value="low">Low priority</option><option value="normal">Normal priority</option><option value="high">High priority</option><option value="urgent">Urgent priority</option></select>
      <input name="confidence" type="number" min="0" max="100" placeholder="Confidence %, optional" />
      <input name="source_name" placeholder="Source name" />
      <input name="source_url" type="url" placeholder="Source URL" />
      <textarea name="summary" rows={4} placeholder="Research summary" className="md:col-span-2" />
      <textarea name="proposed_action" rows={3} placeholder="Suggested next step" className="md:col-span-2" />
      <button className="hgn-btn-primary md:col-span-2">Add to AI Research</button>
    </form>}

    <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <div className="space-y-3">
        {loading && <p className="rounded-2xl border bg-white p-6">Loading AI Research…</p>}
        {!loading && shown.length === 0 && <p className="rounded-2xl border bg-white p-6 text-slate-600">No research items match these filters.</p>}
        {shown.map((item) => {
          const assignee = profiles.find((profile) => profile.user_id === item.assigned_to)
          const confidence = confidencePercent(item)
          const checked = selectedIds.has(item.id)
          return <article key={item.id} className={`cursor-pointer rounded-2xl border bg-white p-5 shadow-sm ${selected === item.id ? "border-hgnBlue ring-1 ring-hgnBlue" : ""}`} onClick={() => void selectItem(item.id)}>
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={checked} onClick={(e) => e.stopPropagation()} onChange={(e) => setSelectedIds((previous) => { const next = new Set(previous); e.target.checked ? next.add(item.id) : next.delete(item.id); return next })} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-hgnBlue">{originLabel(item)} · {pretty(item.item_type)}</p>
                    <h2 className="mt-2 font-serif text-2xl font-bold">{item.title}</h2>
                  </div>
                  {confidence != null && <span className={`rounded-full px-3 py-1 text-xs font-black ${confidence >= 80 ? "bg-emerald-100 text-emerald-900" : confidence >= 65 ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-600"}`}>{confidence}%</span>}
                </div>
                {item.summary && <p className="mt-3 line-clamp-2 leading-6 text-slate-700">{item.summary}</p>}
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-slate-100 px-3 py-1">{pretty(item.verification_status || "unverified")}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">{assignee ? `Assigned: ${profileName(assignee)}` : "Unassigned"}</span>
                  {item.source_name && <span className="rounded-full bg-slate-100 px-3 py-1">{item.source_name}</span>}
                </div>
              </div>
            </div>
          </article>
        })}
      </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        {!current ? <div className="rounded-3xl border border-dashed bg-white p-8 text-center text-slate-500">Choose a research item to verify and promote.</div> : <div className="space-y-5 rounded-3xl border bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-hgnBlue">{originLabel(current)} · {pretty(current.item_type)}</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">{current.title}</h2>
          </div>
          {current.summary && <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{current.summary}</p>}

          {current.payload?.source_excerpt && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <strong>Why the scanner flagged this</strong>
            <p className="mt-2 text-sm leading-6 text-slate-700">{String(current.payload.source_excerpt)}</p>
          </div>}

          {Array.isArray(current.payload?.missing_fields) && current.payload.missing_fields.length > 0 && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
            <strong>Still missing</strong>
            <p className="mt-1">{current.payload.missing_fields.map((value: string) => pretty(value)).join(", ")}</p>
          </div>}

          <div className="grid gap-3">
            <label className="grid gap-1 text-sm font-black">Assign to<select value={current.assigned_to || ""} onChange={(e) => void patch(current, { assigned_to: e.target.value || null }, "assignment_changed", e.target.value)}><option value="">Unassigned</option>{profiles.map((profile) => <option key={profile.user_id} value={profile.user_id}>{profileName(profile)}</option>)}</select></label>
            <label className="grid gap-1 text-sm font-black">Source verification<select value={current.verification_status || "unverified"} onChange={(e) => void patch(current, { verification_status: e.target.value }, "verification_changed", e.target.value)}><option value="unverified">Unverified</option><option value="needs_check">Needs check</option><option value="verified">Verified</option><option value="disputed">Disputed</option></select></label>
          </div>

          <div className="flex flex-wrap gap-2">
            {current.source_url && <a href={current.source_url} target="_blank" rel="noreferrer" className="rounded-full border px-4 py-2 text-sm font-black">Open source <ExternalLink className="inline" size={14} /></a>}
            {current.related_record_url && <Link href={current.related_record_url} className="rounded-full border px-4 py-2 text-sm font-black">Open promoted draft</Link>}
          </div>

          <div className="grid gap-2">
            <button disabled={busy === current.id || current.verification_status !== "verified"} onClick={() => void (current.item_type === "event" ? createEvent(current) : createArticle(current))} className="hgn-btn-primary disabled:cursor-not-allowed disabled:opacity-50">
              <ShieldCheck className="mr-1 inline" size={16} />{current.item_type === "event" ? "Promote to Event Draft" : "Promote to Article Draft"}
            </button>
            {current.verification_status !== "verified" && <p className="text-xs text-slate-500">Verify the source before promotion becomes available.</p>}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => void patch(current, { status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: userId }, "approved")} className="rounded-full border px-3 py-2 text-sm font-black"><CheckCircle2 className="mr-1 inline" size={15} />Keep</button>
              <button onClick={() => void patch(current, { status: "rejected" }, "rejected")} className="rounded-full border px-3 py-2 text-sm font-black"><XCircle className="mr-1 inline" size={15} />Reject</button>
            </div>
            <button onClick={() => void patch(current, { status: "archived", archived_at: new Date().toISOString() }, "archived")} className="rounded-full border px-3 py-2 text-sm font-black"><Archive className="mr-1 inline" size={15} />Archive</button>
          </div>

          <form onSubmit={addComment} className="grid gap-2 border-t pt-4">
            <strong>Internal notes</strong>
            <textarea name="body" rows={3} required placeholder="Add a newsroom note" />
            <button className="rounded-full border px-4 py-2 text-sm font-black">Add note</button>
          </form>

          {comments.length > 0 && <div className="space-y-2">{comments.map((comment) => <p key={comment.id} className="rounded-xl bg-slate-50 p-3 text-sm"><span className="block text-xs text-slate-500">{new Date(comment.created_at).toLocaleString()}</span>{comment.body}</p>)}</div>}
          {activity.length > 0 && <details className="border-t pt-4"><summary className="cursor-pointer font-black">Activity history</summary><div className="mt-3 space-y-2">{activity.slice(0, 12).map((entry) => <p key={entry.id} className="text-xs text-slate-600"><strong>{pretty(entry.action)}</strong>{entry.detail ? ` · ${entry.detail}` : ""}<span className="block text-slate-400">{new Date(entry.created_at).toLocaleString()}</span></p>)}</div></details>}
        </div>}
      </aside>
    </section>
  </main>
}
