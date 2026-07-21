"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Horoscope = {
  id: string
  title: string | null
  horoscope_date: string | null
  author_name: string | null
  body: string | null
  status: string | null
  published_at: string | null
}

export default function EditHoroscopePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [item, setItem] = useState<Horoscope | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setMessage("")

    const { data, error } = await supabase.from("horoscopes").select("*").eq("id", params.id).maybeSingle()
    if (error) setMessage(error.message)
    else setItem(data || null)

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [params.id])

  function patch(field: keyof Horoscope, value: string) {
    setItem((current) => (current ? { ...current, [field]: value } : current))
  }

  async function save(nextStatus?: "draft" | "published") {
    if (!item) return
    if (!item.title?.trim()) {
      setMessage("Please enter a title.")
      return
    }

    setSaving(true)
    setMessage("")

    const status = nextStatus || item.status || "draft"
    const now = new Date().toISOString()
    const { error } = await supabase
      .from("horoscopes")
      .update({
        title: item.title.trim(),
        horoscope_date: item.horoscope_date || null,
        author_name: item.author_name?.trim() || null,
        body: item.body || "",
        status,
        published_at: status === "published" ? item.published_at || now : null,
        updated_at: now,
      })
      .eq("id", item.id)

    if (error) setMessage(error.message)
    else {
      setMessage(status === "published" ? "Published." : "Saved.")
      await load()
    }

    setSaving(false)
  }

  async function deleteItem() {
    if (!item) return
    if (!window.confirm("Delete this horoscope?")) return

    setSaving(true)
    const { error } = await supabase.from("horoscopes").delete().eq("id", item.id)
    if (error) {
      setMessage(error.message)
      setSaving(false)
    } else {
      router.push("/admin/horoscope")
    }
  }

  if (loading) return <main className="px-6 py-10">Loading…</main>
  if (!item) return <main className="px-6 py-10">Horoscope not found.</main>

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <Link href="/admin/horoscope" className="text-sm font-semibold text-slate-600">← Back to Horoscope</Link>

      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Edit Horoscope</h1>
        <p className="mt-3 text-slate-600">Status: <strong>{item.status || "draft"}</strong></p>

        {message ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">{message}</p> : null}

        <div className="mt-6 grid gap-4">
          <label className="block">
            <span className="text-sm font-semibold">Title</span>
            <input value={item.title || ""} onChange={(event) => patch("title", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold">Date</span>
              <input type="date" value={item.horoscope_date || ""} onChange={(event) => patch("horoscope_date", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Author</span>
              <input value={item.author_name || ""} onChange={(event) => patch("author_name", event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold">Horoscope text</span>
            <textarea value={item.body || ""} onChange={(event) => patch("body", event.target.value)} rows={18} className="mt-2 w-full rounded-2xl border px-4 py-3" />
          </label>

          <div className="flex flex-wrap gap-2">
            <button disabled={saving} onClick={() => save()} className="rounded-full bg-slate-800 px-5 py-3 text-sm font-black uppercase tracking-wide text-white disabled:opacity-50">Save</button>
            <button disabled={saving} onClick={() => save("published")} className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white disabled:opacity-50">Publish</button>
            <button disabled={saving} onClick={() => save("draft")} className="rounded-full bg-slate-200 px-5 py-3 text-sm font-black uppercase tracking-wide text-slate-700 disabled:opacity-50">Draft</button>
            <button disabled={saving} onClick={deleteItem} className="rounded-full bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white disabled:opacity-50">Delete</button>
          </div>
        </div>
      </section>
    </main>
  )
}
