"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type EventSubmission = Record<string, any>

function buildPublicEventPayload(item: EventSubmission) {
  const startDate = item.start_date || item.event_date || null
  return {
    title: item.title,
    description: item.description,
    event_date: startDate,
    start_date: startDate,
    end_date: item.end_date || startDate,
    start_time: item.is_all_day ? null : item.start_time || null,
    end_time: item.is_all_day ? null : item.end_time || null,
    is_all_day: Boolean(item.is_all_day),
    location: item.location,
    community: item.community,
    organizer_name: item.organizer_name || item.contact_name || null,
    organizer_email: item.organizer_email || item.contact_email || null,
    organizer_phone: item.organizer_phone || item.contact_phone || null,
    image_url: item.image_url || null,
    status: "published",
    source: "submitted",
    updated_at: new Date().toISOString(),
  }
}

export default function AdminEventsPage() {
  const [items, setItems] = useState<EventSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState("")
  const [message, setMessage] = useState("")

  async function load() {
    setLoading(true)
    setMessage("")
    const { data, error } = await supabase.from("event_submissions").select("*").order("created_at", { ascending: false }).limit(150)
    if (error) setMessage(error.message)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function approve(item: EventSubmission) {
    setWorking(item.id)
    setMessage("")
    const payload = buildPublicEventPayload(item)
    let eventId = item.published_event_id

    if (eventId) {
      const { error } = await supabase.from("events").update(payload).eq("id", eventId)
      if (error) {
        setMessage(error.message)
        setWorking("")
        return
      }
    } else {
      const { data, error } = await supabase.from("events").insert(payload).select("id").single()
      if (error) {
        setMessage(error.message)
        setWorking("")
        return
      }
      eventId = data?.id
    }

    const { error: updateError } = await supabase.from("event_submissions").update({
      status: "approved",
      published_event_id: eventId || null,
      updated_at: new Date().toISOString(),
    }).eq("id", item.id)

    if (updateError) setMessage(updateError.message)
    else await load()
    setWorking("")
  }

  async function setStatus(item: EventSubmission, status: "pending" | "rejected") {
    setWorking(item.id)
    setMessage("")
    const { error } = await supabase.from("event_submissions").update({ status, updated_at: new Date().toISOString() }).eq("id", item.id)
    if (error) setMessage(error.message)
    else await load()
    setWorking("")
  }

  async function deleteItem(item: EventSubmission) {
    if (!window.confirm("Delete this event submission?")) return
    setWorking(item.id)
    const { error } = await supabase.from("event_submissions").delete().eq("id", item.id)
    if (error) setMessage(error.message)
    else await load()
    setWorking("")
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <Link href="/admin" className="text-sm font-bold text-hgnBlue">← Back to Admin</Link>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">HGN Admin</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Event Submissions</h1>
        <p className="mt-3 text-slate-600">Approve submitted events here. Approved events are copied to the public events table.</p>
        <button onClick={load} className="mt-6 rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white">Refresh</button>
        {message ? <p className="mt-4 rounded-2xl border bg-amber-50 p-4 text-sm text-amber-900">{message}</p> : null}
      </section>

      {loading ? <p className="rounded-2xl border bg-white p-6">Loading events...</p> : items.length === 0 ? <p className="rounded-2xl border bg-white p-6">No submitted events yet.</p> : (
        <section className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{item.title || "Untitled event"}</h2>
                  <p className="mt-1 text-sm text-slate-500">{formatDate(item.start_date || item.event_date)}{item.end_date && item.end_date !== (item.start_date || item.event_date) ? ` to ${formatDate(item.end_date)}` : ""} · {item.is_all_day ? "All day" : item.start_time || "Time TBA"} · {item.location || item.community || "Location TBA"}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">{item.status || "pending"}</span>
              </div>
              {item.image_url ? <img src={item.image_url} alt="" className="mt-4 max-h-56 rounded-2xl object-cover" /> : null}
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.description}</p>
              <p className="mt-3 text-sm text-slate-500">Contact: {item.organizer_name || item.contact_name || "No name"} · {item.organizer_email || item.contact_email || "No email"} · {item.organizer_phone || item.contact_phone || "No phone"}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/admin/events/${item.id}`} className="rounded-full bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">Edit</Link>
                <button disabled={working === item.id} onClick={() => approve(item)} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Approve & publish</button>
                <button disabled={working === item.id} onClick={() => setStatus(item, "pending")} className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 disabled:opacity-50">Pending</button>
                <button disabled={working === item.id} onClick={() => setStatus(item, "rejected")} className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Reject</button>
                <button disabled={working === item.id} onClick={() => deleteItem(item)} className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Delete</button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

function formatDate(value?: string | null) {
  if (!value) return "Date TBA"
  try {
    return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`))
  } catch {
    return value
  }
}
