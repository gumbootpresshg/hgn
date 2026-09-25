"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { Archive, Copy, Eye, Plus, Save, Search, Trash2, Upload } from "lucide-react"
import { supabase } from "@/lib/supabase"

type EventRecord = { id: string; title?: string | null; description?: string | null; category?: string | null; start_date?: string | null; end_date?: string | null; event_date?: string | null; start_time?: string | null; end_time?: string | null; is_all_day?: boolean | null; location?: string | null; community?: string | null; organizer_name?: string | null; organizer_email?: string | null; organizer_phone?: string | null; image_url?: string | null; website?: string | null; status?: string | null; source?: string | null; created_at?: string | null }
type Submission = EventRecord & { published_event_id?: string | null; contact_name?: string | null; contact_email?: string | null; contact_phone?: string | null }

const communities = ["Haida Gwaii", "Daajing Giids", "Skidegate", "Tlell", "Port Clements", "Masset", "Old Massett", "Sandspit", "Island-wide", "Other"]
const categories = ["Community", "Arts & Culture", "Music", "Sports", "Meeting", "Market", "Family", "Fundraiser", "School", "Government", "Other"]
const DRAFT_KEY = "hgn:events:working-draft:v1"
const emptyEvent = (): EventRecord => ({ id: "new", title: "", description: "", category: "Community", start_date: "", end_date: "", start_time: "", end_time: "", is_all_day: false, location: "", community: "Haida Gwaii", organizer_name: "", organizer_email: "", organizer_phone: "", image_url: "", website: "", status: "draft" })

async function authHeaders(): Promise<Record<string, string>> { const { data } = await supabase.auth.getSession(); return data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {} }
function dateLabel(value?: string | null) { if (!value) return "Date to be set"; try { return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`)) } catch { return value } }

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selected, setSelected] = useState<EventRecord>(emptyEvent())
  const [tab, setTab] = useState<"calendar" | "submissions">("calendar")
  const [filter, setFilter] = useState("upcoming")
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const draftReady = useRef(false)

  async function load() {
    setLoading(true)
    const response = await fetch("/api/admin/events", { headers: await authHeaders(), cache: "no-store" })
    const data = await response.json().catch(() => ({}))
    if (response.ok) { setEvents(data.events || []); setSubmissions(data.submissions || []) } else setMessage(data.error || "Could not load events.")
    setLoading(false)
  }

  useEffect(() => {
    void load()
    try { const stored = window.localStorage.getItem(DRAFT_KEY); if (stored) { const parsed = JSON.parse(stored); if (parsed && typeof parsed === "object") { setSelected({ ...emptyEvent(), ...parsed, id: "new", status: "draft" }); setMessage("Restored your unfinished event draft.") } } } catch {}
    draftReady.current = true
  }, [])
  useEffect(() => { if (!draftReady.current || selected.id !== "new") return; try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify(selected)) } catch {} }, [selected])

  const visibleEvents = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return events.filter((event) => {
      const haystack = `${event.title || ""} ${event.location || ""} ${event.community || ""} ${event.category || ""}`.toLowerCase()
      if (!haystack.includes(query.toLowerCase())) return false
      if (filter === "upcoming") return event.status !== "archived" && (event.status === "draft" || String(event.start_date || event.event_date || "") >= today)
      if (filter === "draft") return event.status === "draft"
      if (filter === "published") return event.status === "published"
      if (filter === "archived") return event.status === "archived"
      return true
    })
  }, [events, filter, query])
  const visibleSubmissions = useMemo(() => submissions.filter((submission) => `${submission.title || ""} ${submission.location || ""} ${submission.community || ""}`.toLowerCase().includes(query.toLowerCase())), [submissions, query])

  function startNew() { setSelected(emptyEvent()); setTab("calendar"); setMessage(""); try { window.localStorage.removeItem(DRAFT_KEY) } catch {} }
  function edit(event: EventRecord) { setSelected({ ...emptyEvent(), ...event, start_date: event.start_date || event.event_date || "", end_date: event.end_date || event.start_date || event.event_date || "" }); setTab("calendar"); setMessage("") }
  function duplicate() { setSelected({ ...selected, id: "new", title: selected.title ? `${selected.title} (copy)` : "", status: "draft" }); setMessage("Copied as a new draft. Set the new date before publishing.") }
  const patch = (field: keyof EventRecord, value: any) => setSelected((current) => ({ ...current, [field]: value }))

  async function save(status?: "draft" | "published" | "archived") {
    setBusy(true); setMessage("")
    const creating = selected.id === "new"
    const response = await fetch(creating ? "/api/admin/events" : `/api/admin/events/${selected.id}`, { method: creating ? "POST" : "PATCH", headers: { ...(await authHeaders()), "Content-Type": "application/json" }, body: JSON.stringify({ ...selected, status: status || selected.status }) })
    const data = await response.json().catch(() => ({}))
    if (response.ok && data.event) { setSelected(data.event); setMessage(creating ? "Event created." : "Event saved."); try { window.localStorage.removeItem(DRAFT_KEY) } catch {}; await load() } else setMessage(data.error || "Could not save this event.")
    setBusy(false)
  }
  async function remove() {
    if (selected.id === "new") return startNew()
    if (!window.confirm(`Delete “${selected.title || "this event"}”? This cannot be undone.`)) return
    setBusy(true)
    const response = await fetch(`/api/admin/events/${selected.id}`, { method: "DELETE", headers: await authHeaders() })
    const data = await response.json().catch(() => ({}))
    if (response.ok) { startNew(); setMessage("Event deleted."); await load() } else setMessage(data.error || "Could not delete this event.")
    setBusy(false)
  }
  async function uploadImage(file: File) {
    if (!file?.size) return
    setUploading(true); setMessage("")
    try {
      const response = await fetch("/api/admin/events/upload-url", { method: "POST", headers: { ...(await authHeaders()), "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }) })
      const upload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(upload.error || "Could not prepare image upload.")
      const { error } = await supabase.storage.from(upload.bucket).uploadToSignedUrl(upload.path, upload.token, file, { contentType: file.type, upsert: false }); if (error) throw error
      setSelected((current) => ({ ...current, image_url: String(upload.publicUrl || "") })); setMessage("Event image uploaded. Save the event to keep it.")
    } catch (error: any) { setMessage(error?.message || "Could not upload event image.") } finally { setUploading(false) }
  }

  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
    <section className="rounded-3xl border bg-white p-7 shadow-sm"><p className="text-sm font-black uppercase tracking-[.18em] text-hgnBlue">Community</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-serif text-5xl font-bold">Events</h1><p className="mt-2 max-w-3xl text-slate-600">Create and publish HGN calendar events directly. Reader submissions stay separate until you review them.</p></div><div className="flex flex-wrap gap-2"><Link href="/events" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black"><Eye size={16} />View calendar</Link><button onClick={startNew} className="hgn-btn-primary inline-flex items-center gap-2"><Plus size={16} />New Event</button></div></div></section>
    {message ? <div className="rounded-2xl border bg-white p-4 font-bold">{message}</div> : null}
    <div className="grid gap-6 lg:grid-cols-[.9fr_1.35fr]">
      <section className="rounded-3xl border bg-white p-5 shadow-sm"><div className="flex gap-2 border-b pb-4"><button onClick={() => setTab("calendar")} className={`rounded-full px-4 py-2 text-sm font-black ${tab === "calendar" ? "bg-hgnNavy text-white" : "border"}`}>Calendar events</button><button onClick={() => setTab("submissions")} className={`rounded-full px-4 py-2 text-sm font-black ${tab === "submissions" ? "bg-hgnNavy text-white" : "border"}`}>Community submissions {submissions.filter((s) => s.status === "pending").length ? `(${submissions.filter((s) => s.status === "pending").length})` : ""}</button></div>
        <div className="mt-4 flex flex-wrap gap-2"><div className="relative min-w-[180px] flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tab === "calendar" ? "Search events" : "Search submissions"} className="w-full rounded-xl border py-2.5 pl-9 pr-3" /></div>{tab === "calendar" ? <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-xl border px-3 py-2.5 text-sm font-bold"><option value="upcoming">Upcoming</option><option value="draft">Drafts</option><option value="published">Published</option><option value="archived">Archived</option><option value="all">All events</option></select> : null}</div>
        {loading ? <p className="mt-5 rounded-2xl border p-5 text-sm text-slate-500">Loading events…</p> : tab === "calendar" ? <div className="mt-4 space-y-2">{visibleEvents.map((event) => <button key={event.id} onClick={() => edit(event)} className={`w-full rounded-2xl border p-4 text-left transition hover:border-hgnBlue hover:shadow-sm ${selected.id === event.id ? "border-hgnBlue ring-2 ring-blue-100" : ""}`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-hgnBlue">{dateLabel(event.start_date || event.event_date)} · {event.status || "draft"}</p><h2 className="mt-1 text-lg font-black text-slate-950">{event.title || "Untitled event"}</h2><p className="mt-1 text-xs text-slate-500">{[event.community, event.location].filter(Boolean).join(" · ") || "Location to be set"}</p></div>{event.status === "published" ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-800">LIVE</span> : null}</div></button>)}{!visibleEvents.length ? <div className="rounded-2xl border border-dashed p-6 text-sm text-slate-500">No events in this view. Use New Event to add one directly.</div> : null}</div> : <div className="mt-4 space-y-2">{visibleSubmissions.map((submission) => <article key={submission.id} className="rounded-2xl border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-hgnBlue">{dateLabel(submission.start_date || submission.event_date)} · {submission.status || "pending"}</p><h2 className="mt-1 text-lg font-black">{submission.title || "Untitled submission"}</h2><p className="mt-1 text-xs text-slate-500">{[submission.community, submission.location].filter(Boolean).join(" · ") || "Location to be set"}</p></div><Link href={`/admin/events/${submission.id}`} className="rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white">Review</Link></div>{submission.published_event_id ? <p className="mt-2 text-xs font-bold text-emerald-700">Already published to the calendar.</p> : null}</article>)}{!visibleSubmissions.length ? <div className="rounded-2xl border border-dashed p-6 text-sm text-slate-500">No community submissions match this search.</div> : null}</div>}</section>
      <section className="rounded-3xl border bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-hgnBlue">{selected.id === "new" ? "New staff event" : "Edit calendar event"}</p><h2 className="mt-1 text-3xl font-black">{selected.title || "Untitled Event"}</h2></div><div className="flex gap-2">{selected.id !== "new" ? <button onClick={duplicate} className="rounded-full border p-2" title="Duplicate as draft"><Copy size={18} /></button> : null}{selected.id !== "new" ? <button onClick={() => void remove()} disabled={busy} className="rounded-full border border-red-200 p-2 text-red-700 hover:bg-red-50" title="Delete"><Trash2 size={18} /></button> : null}</div></div>
        <div className="mt-5 grid gap-4"><label className="grid gap-1 text-sm font-bold">Event title *<input value={selected.title || ""} onChange={(event) => patch("title", event.target.value)} className="rounded-xl border px-3 py-2.5" /></label><label className="grid gap-1 text-sm font-bold">Description<textarea rows={6} value={selected.description || ""} onChange={(event) => patch("description", event.target.value)} placeholder="What readers need to know…" className="rounded-xl border px-3 py-2.5" /></label><div className="grid gap-4 md:grid-cols-2"><label className="grid gap-1 text-sm font-bold">Community<select value={selected.community || "Haida Gwaii"} onChange={(event) => patch("community", event.target.value)} className="rounded-xl border px-3 py-2.5">{communities.map((community) => <option key={community}>{community}</option>)}</select></label><label className="grid gap-1 text-sm font-bold">Category<select value={selected.category || "Community"} onChange={(event) => patch("category", event.target.value)} className="rounded-xl border px-3 py-2.5">{categories.map((category) => <option key={category}>{category}</option>)}</select></label></div><label className="grid gap-1 text-sm font-bold">Location / venue<input value={selected.location || ""} onChange={(event) => patch("location", event.target.value)} placeholder="Venue, meeting point or online" className="rounded-xl border px-3 py-2.5" /></label><label className="flex items-center gap-2 rounded-xl border p-3 text-sm font-bold"><input type="checkbox" checked={Boolean(selected.is_all_day)} onChange={(event) => patch("is_all_day", event.target.checked)} />All-day event</label><div className="grid gap-4 md:grid-cols-2"><label className="grid gap-1 text-sm font-bold">Start date *<input type="date" value={selected.start_date || ""} onChange={(event) => patch("start_date", event.target.value)} className="rounded-xl border px-3 py-2.5" /></label><label className="grid gap-1 text-sm font-bold">End date <span className="font-normal text-slate-500">(multi-day)</span><input type="date" value={selected.end_date || ""} onChange={(event) => patch("end_date", event.target.value)} className="rounded-xl border px-3 py-2.5" /></label></div>{!selected.is_all_day ? <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-1 text-sm font-bold">Start time<input type="time" value={selected.start_time || ""} onChange={(event) => patch("start_time", event.target.value)} className="rounded-xl border px-3 py-2.5" /></label><label className="grid gap-1 text-sm font-bold">End time<input type="time" value={selected.end_time || ""} onChange={(event) => patch("end_time", event.target.value)} className="rounded-xl border px-3 py-2.5" /></label></div> : null}<div className="grid gap-4 md:grid-cols-3"><label className="grid gap-1 text-sm font-bold">Organizer<input value={selected.organizer_name || ""} onChange={(event) => patch("organizer_name", event.target.value)} className="rounded-xl border px-3 py-2.5" /></label><label className="grid gap-1 text-sm font-bold">Email<input type="email" value={selected.organizer_email || ""} onChange={(event) => patch("organizer_email", event.target.value)} className="rounded-xl border px-3 py-2.5" /></label><label className="grid gap-1 text-sm font-bold">Phone<input value={selected.organizer_phone || ""} onChange={(event) => patch("organizer_phone", event.target.value)} className="rounded-xl border px-3 py-2.5" /></label></div><label className="grid gap-1 text-sm font-bold">Event website<input type="url" value={selected.website || ""} onChange={(event) => patch("website", event.target.value)} placeholder="https://…" className="rounded-xl border px-3 py-2.5" /></label><div className="rounded-2xl border bg-slate-50 p-4"><div className="flex items-center gap-2 text-sm font-black"><Upload size={16} />Event image</div><p className="mt-1 text-xs text-slate-500">Upload a JPG, PNG, WebP or GIF from your computer. It uploads directly to HGN media storage.</p><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); event.currentTarget.value = "" }} className="mt-3 block w-full rounded-xl border bg-white px-3 py-2.5 text-sm" />{uploading ? <p className="mt-2 text-xs font-bold text-slate-500">Uploading image…</p> : null}{selected.image_url ? <div className="mt-3"><img src={selected.image_url} alt="Event preview" className="max-h-52 rounded-xl object-cover" /><button type="button" onClick={() => patch("image_url", "")} className="mt-2 rounded-full border px-3 py-1.5 text-xs font-black text-red-700">Remove image</button></div> : null}</div><label className="grid gap-1 text-sm font-bold">Or paste an image URL<input value={selected.image_url || ""} onChange={(event) => patch("image_url", event.target.value)} placeholder="Optional external image URL" className="rounded-xl border px-3 py-2.5" /></label>{selected.id === "new" ? <p className="text-xs text-slate-500">Your unfinished draft is saved in this browser while you work. It is not public until you publish it.</p> : null}<div className="flex flex-wrap gap-2 border-t pt-4"><button disabled={busy} onClick={() => void save("draft")} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-black"><Save size={16} />Save Draft</button><button disabled={busy} onClick={() => void save("published")} className="hgn-btn-primary">{busy ? "Saving…" : "Publish"}</button>{selected.id !== "new" && selected.status !== "archived" ? <button disabled={busy} onClick={() => void save("archived")} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-black"><Archive size={16} />Archive</button> : null}</div></div>
      </section>
    </div>
  </main>
}
