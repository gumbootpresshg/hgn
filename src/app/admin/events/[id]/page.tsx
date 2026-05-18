"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

type EventSubmission = Record<string, any>

export default function EditEventSubmissionPage() {
  const params = useParams<{ id: string }>()
  const [item, setItem] = useState<EventSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from("event_submissions").select("*").eq("id", params.id).single()
    if (error) setMessage(error.message)
    setItem(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [params.id])

  function patch(field: string, value: string) {
    setItem((current) => current ? { ...current, [field]: value } : current)
  }

  async function save(status?: string) {
    if (!item) return
    setSaving(true)
    setMessage("")

    const { error } = await supabase
      .from("event_submissions")
      .update({
        title: item.title,
        description: item.description,
        event_date: item.start_date || item.event_date || null,
        start_date: item.start_date || item.event_date || null,
        end_date: item.end_date || item.start_date || item.event_date || null,
        start_time: item.is_all_day ? null : item.start_time || null,
        end_time: item.is_all_day ? null : item.end_time || null,
        is_all_day: Boolean(item.is_all_day),
        image_url: item.image_url || null,
        location: item.location || null,
        community: item.community || null,
        organizer_name: item.organizer_name || null,
        organizer_email: item.organizer_email || null,
        organizer_phone: item.organizer_phone || null,
        admin_notes: item.admin_notes || null,
        status: status || item.status || "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)

    if (error) setMessage(error.message)
    else setMessage("Saved.")
    setSaving(false)
  }

  async function approveAndPublish() {
    if (!item) return
    setSaving(true)
    setMessage("")

    const startDate = item.start_date || item.event_date || null
    const payload = {
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

    let eventId = item.published_event_id

    if (eventId) {
      const update = await supabase.from("events").update(payload).eq("id", eventId)
      if (update.error) {
        setMessage(update.error.message)
        setSaving(false)
        return
      }
    } else {
      const insert = await supabase.from("events").insert(payload).select("id").single()
      if (insert.error) {
        setMessage(insert.error.message)
        setSaving(false)
        return
      }
      eventId = insert.data?.id
    }

    const { error } = await supabase
      .from("event_submissions")
      .update({
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
        status: "approved",
        published_event_id: eventId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)

    if (error) setMessage(error.message)
    else {
      setMessage("Approved and published.")
      await load()
    }

    setSaving(false)
  }

  if (loading) return <main className="px-6 py-10">Loading...</main>
  if (!item) return <main className="px-6 py-10">Event not found.</main>

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div className="flex flex-wrap gap-3 text-sm font-semibold">
        <Link href="/admin" className="text-hgnBlue">← Back to Admin</Link>
        <Link href="/admin/events" className="text-slate-600">Back to event submissions</Link>
      </div>

      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight">Edit Event Submission</h1>
        {message ? <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm">{message}</p> : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Event title" value={item.title || ""} onChange={(v) => patch("title", v)} />
          <Field label="Start date" type="date" value={item.start_date || item.event_date || ""} onChange={(v) => patch("start_date", v)} />
          <Field label="End date" type="date" value={item.end_date || ""} onChange={(v) => patch("end_date", v)} />
          <Field label="Start time" type="time" value={item.start_time || ""} onChange={(v) => patch("start_time", v)} />
          <Field label="End time" type="time" value={item.end_time || ""} onChange={(v) => patch("end_time", v)} />
          <Field label="Location" value={item.location || ""} onChange={(v) => patch("location", v)} />
          <Field label="Community" value={item.community || ""} onChange={(v) => patch("community", v)} />
          <Field label="Organizer name" value={item.organizer_name || ""} onChange={(v) => patch("organizer_name", v)} />
          <Field label="Organizer email" value={item.organizer_email || ""} onChange={(v) => patch("organizer_email", v)} />
          <Field label="Organizer phone" value={item.organizer_phone || item.contact_phone || ""} onChange={(v) => patch("organizer_phone", v)} />
          <Field label="Image URL" value={item.image_url || ""} onChange={(v) => patch("image_url", v)} />
        </div>

        <label className="mt-4 flex items-center gap-2 rounded-2xl border p-4 text-sm font-bold">
          <input type="checkbox" checked={Boolean(item.is_all_day)} onChange={(e) => setItem((current) => current ? { ...current, is_all_day: e.target.checked } : current)} />
          All-day event
        </label>

        {item.image_url ? <img src={item.image_url} alt="" className="mt-4 max-h-72 rounded-2xl object-cover" /> : null}

        <label className="mt-4 block">
          <span className="text-sm font-semibold">Description</span>
          <textarea value={item.description || ""} onChange={(e) => patch("description", e.target.value)} rows={8} className="mt-2 w-full rounded-2xl border px-4 py-3" />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold">Admin notes</span>
          <textarea value={item.admin_notes || ""} onChange={(e) => patch("admin_notes", e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border px-4 py-3" />
        </label>

        <div className="mt-6 flex flex-wrap gap-2">
          <button disabled={saving} onClick={() => save()} className="rounded-full bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Save</button>
          <button disabled={saving} onClick={approveAndPublish} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Approve & publish</button>
          <button disabled={saving} onClick={() => save("pending")} className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 disabled:opacity-50">Pending</button>
          <button disabled={saving} onClick={() => save("rejected")} className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Reject</button>
        </div>
      </section>
    </main>
  )
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; type?: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3" />
    </label>
  )
}
