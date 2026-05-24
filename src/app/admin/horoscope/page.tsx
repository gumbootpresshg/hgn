"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Horoscope = {
  id: string
  title: string | null
  horoscope_date: string | null
  author_name: string | null
  status: string | null
  published_at: string | null
  created_at: string | null
}

function prettyDate(value: string | null) {
  if (!value) return "No date"
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export default function AdminHoroscopePage() {
  const [items, setItems] = useState<Horoscope[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [working, setWorking] = useState("")

  async function load() {
    setLoading(true)
    setMessage("")

    const { data, error } = await supabase
      .from("horoscopes")
      .select("id,title,horoscope_date,author_name,status,published_at,created_at")
      .order("horoscope_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })

    if (error) setMessage(error.message)
    else setItems(data || [])

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function setStatus(item: Horoscope, status: "draft" | "published") {
    setWorking(`${item.id}-${status}`)
    setMessage("")

    const payload = {
      status,
      published_at: status === "published" ? item.published_at || new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("horoscopes").update(payload).eq("id", item.id)
    if (error) setMessage(error.message)
    else await load()

    setWorking("")
  }

  async function deleteItem(item: Horoscope) {
    if (!window.confirm("Delete this horoscope?")) return
    setWorking(`delete-${item.id}`)
    setMessage("")

    const { error } = await supabase.from("horoscopes").delete().eq("id", item.id)
    if (error) setMessage(error.message)
    else await load()

    setWorking("")
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <Link href="/admin" className="text-sm font-semibold text-slate-600">← Back to Admin</Link>

      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Horoscope</h1>
        <p className="mt-3 text-slate-600">Create, edit, publish, unpublish, or delete horoscope posts.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/admin/horoscope/new" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-wide text-white">
            Add Horoscope
          </Link>
          <Link href="/horoscope" className="rounded-full border px-5 py-3 text-sm font-black uppercase tracking-wide">
            View Public Page
          </Link>
        </div>
      </section>

      {message ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-red-600">{message}</p> : null}

      {loading ? (
        <p className="rounded-2xl border bg-white p-6">Loading horoscopes…</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6">No horoscope posts yet.</p>
      ) : (
        <section className="grid gap-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-3xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">{item.status || "draft"}</p>
                  <h2 className="mt-2 text-xl font-black">{item.title || "Untitled horoscope"}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {[prettyDate(item.horoscope_date), item.author_name].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/horoscope/${item.id}`} className="rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide">Edit</Link>
                  {item.status === "published" ? (
                    <button disabled={working === `${item.id}-draft`} onClick={() => setStatus(item, "draft")} className="rounded-full bg-slate-200 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-700 disabled:opacity-50">
                      Unpublish
                    </button>
                  ) : (
                    <button disabled={working === `${item.id}-published`} onClick={() => setStatus(item, "published")} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-wide text-white disabled:opacity-50">
                      Publish
                    </button>
                  )}
                  <button disabled={working === `delete-${item.id}`} onClick={() => deleteItem(item)} className="rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-wide text-white disabled:opacity-50">
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
