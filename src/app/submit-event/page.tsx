"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ensureHgnProfile } from "@/lib/ensure-hgn-profile"

const communities = ["Daajing Giids", "Skidegate", "Tlell", "Port Clements", "Masset", "Old Massett", "Sandspit", "Island-wide", "Other"]

async function uploadEventPhoto(file: File) {
  const ext = file.name.split(".").pop() || "jpg"
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
  const path = `events/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`
  const { error } = await supabase.storage.from("hgn-media").upload(path, file, { upsert: false })
  if (error) throw error
  return supabase.storage.from("hgn-media").getPublicUrl(path).data.publicUrl
}

export default function SubmitEventPage() {
  const [user, setUser] = useState<any>(null)
  const [allDay, setAllDay] = useState(false)
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      if (data.user) await ensureHgnProfile(data.user)
    }
    load()
  }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setSaving(true)

    try {
      const form = new FormData(event.currentTarget)
      const title = String(form.get("title") || "").trim()
      const description = String(form.get("description") || "").trim()
      const location = String(form.get("location") || "").trim()
      const community = String(form.get("community") || "").trim()
      const startDate = String(form.get("start_date") || "")
      const endDate = String(form.get("end_date") || startDate) || startDate
      const photo = form.get("photo")

      if (!title || !description || !location || !community || !startDate) {
        setMessage("Please fill out the title, description, location, community, and start date before submitting.")
        setSaving(false)
        return
      }

      let imageUrl: string | null = null
      if (photo instanceof File && photo.size > 0) {
        imageUrl = await uploadEventPhoto(photo)
      }

      const { error } = await supabase.from("event_submissions").insert({
        user_id: user?.id || null,
        title,
        description,
        location,
        community,
        contact_name: String(form.get("contact_name") || ""),
        contact_email: String(form.get("contact_email") || user?.email || ""),
        contact_phone: String(form.get("contact_phone") || ""),
        is_all_day: allDay,
        start_date: startDate || null,
        end_date: endDate || startDate || null,
        start_time: allDay ? null : String(form.get("start_time") || "") || null,
        end_time: allDay ? null : String(form.get("end_time") || "") || null,
        image_url: imageUrl,
        status: "pending",
        updated_at: new Date().toISOString(),
      })

      if (error) setMessage(error.message)
      else {
        setMessage("Event submitted for review.")
        event.currentTarget.reset()
        setAllDay(false)
      }
    } catch (error: any) {
      setMessage(error?.message || "Could not submit event.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Community Events</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Submit an Event</h1>
        <p className="mt-3 text-slate-600">Submit a community event for HGN review. Multi-day events, all-day events, times, and photos are supported.</p>
        {!user ? (
          <p className="mt-3 text-sm text-slate-500">
            Signing in lets you manage your submissions later. <Link href="/login" className="font-bold text-hgnBlue">Sign in</Link>
          </p>
        ) : null}
      </section>

      <form onSubmit={submit} className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
        <input name="title" required placeholder="Event title *" className="w-full rounded-2xl border px-4 py-3" />
        <textarea name="description" required rows={5} placeholder="Event description *" className="w-full rounded-2xl border px-4 py-3" />

        <div className="grid gap-4 md:grid-cols-2">
          <input name="location" required placeholder="Location / venue *" className="rounded-2xl border px-4 py-3" />
          <select name="community" required defaultValue="" className="rounded-2xl border px-4 py-3">
            <option value="" disabled>Community *</option>
            {communities.map((community) => <option key={community} value={community}>{community}</option>)}
          </select>
        </div>

        <label className="block text-sm font-bold">
          Event photo
          <input name="photo" type="file" accept="image/*" className="mt-2 w-full rounded-2xl border px-4 py-3" />
          <span className="mt-1 block text-xs font-normal text-slate-500">Optional. Upload a poster or event photo.</span>
        </label>

        <label className="flex items-center gap-2 rounded-2xl border p-4 text-sm font-bold">
          <input type="checkbox" checked={allDay} onChange={(event) => setAllDay(event.target.checked)} />
          All-day event
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold">
            Start date
            <input name="start_date" type="date" required className="mt-2 w-full rounded-2xl border px-4 py-3" />
          </label>
          <label className="text-sm font-bold">
            End date <span className="font-normal text-slate-500">(for multi-day events)</span>
            <input name="end_date" type="date" className="mt-2 w-full rounded-2xl border px-4 py-3" />
          </label>
        </div>

        {!allDay ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold">
              Start time
              <input name="start_time" type="time" className="mt-2 w-full rounded-2xl border px-4 py-3" />
            </label>
            <label className="text-sm font-bold">
              End time
              <input name="end_time" type="time" className="mt-2 w-full rounded-2xl border px-4 py-3" />
            </label>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <input name="contact_name" placeholder="Contact name" className="rounded-2xl border px-4 py-3" />
          <input name="contact_email" type="email" defaultValue={user?.email || ""} placeholder="Contact email" className="rounded-2xl border px-4 py-3" />
          <input name="contact_phone" placeholder="Contact phone" className="rounded-2xl border px-4 py-3" />
        </div>

        <button disabled={saving} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
          {saving ? "Submitting..." : "Submit Event"}
        </button>

        {message ? <p className="rounded-2xl bg-slate-50 p-4 text-sm">{message}</p> : null}
      </form>
    </main>
  )
}
