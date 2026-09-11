"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function NewHoroscopePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [horoscopeDate, setHoroscopeDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [authorName, setAuthorName] = useState("Haida Gwaii News")
  const [body, setBody] = useState("")
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  async function save(status: "draft" | "published") {
    if (!title.trim()) {
      setMessage("Please enter a title.")
      return
    }

    setSaving(true)
    setMessage("")

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("horoscopes")
      .insert({
        title: title.trim(),
        horoscope_date: horoscopeDate || null,
        author_name: authorName.trim() || null,
        body: body.trim(),
        status,
        published_at: status === "published" ? now : null,
        created_at: now,
        updated_at: now,
      })
      .select("id")
      .single()

    if (error) {
      setMessage(error.message)
      setSaving(false)
      return
    }

    router.push(data?.id ? `/admin/horoscope/${data.id}` : "/admin/horoscope")
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <Link href="/admin/horoscope" className="text-sm font-semibold text-slate-600">← Back to Horoscope</Link>

      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Add Horoscope</h1>
        <p className="mt-3 text-slate-600">Write a horoscope post. Save it as draft or publish it right away.</p>

        {message ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-red-600">{message}</p> : null}

        <div className="mt-6 grid gap-4">
          <label className="block">
            <span className="text-sm font-semibold">Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3" placeholder="This week's horoscope" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold">Date</span>
              <input type="date" value={horoscopeDate} onChange={(event) => setHoroscopeDate(event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Author</span>
              <input value={authorName} onChange={(event) => setAuthorName(event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold">Horoscope text</span>
            <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={16} className="mt-2 w-full rounded-2xl border px-4 py-3" placeholder="Type the horoscope here..." />
          </label>

          <div className="flex flex-wrap gap-2">
            <button disabled={saving} onClick={() => save("draft")} className="rounded-full bg-slate-200 px-5 py-3 text-sm font-black uppercase tracking-wide text-slate-700 disabled:opacity-50">Save Draft</button>
            <button disabled={saving} onClick={() => save("published")} className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white disabled:opacity-50">Publish</button>
          </div>
        </div>
      </section>
    </main>
  )
}
