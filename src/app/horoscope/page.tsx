"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Horoscope = {
  id: string
  title: string | null
  horoscope_date: string | null
  body: string | null
  author_name: string | null
  status: string | null
  published_at: string | null
}

function prettyDate(value: string | null) {
  if (!value) return ""
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export default function HoroscopePage() {
  const [loading, setLoading] = useState(true)
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function load() {
      setLoading(true)
      setMessage("")

      const { data, error } = await supabase
        .from("horoscopes")
        .select("*")
        .eq("status", "published")
        .order("horoscope_date", { ascending: false, nullsFirst: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(1)

      if (error) setMessage(error.message)
      else setHoroscope((data || [])[0] || null)

      setLoading(false)
    }

    load()
  }, [])

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-hgnBlue">Horoscope</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-hgnNavy">Horoscope</h1>
        <p className="mt-3 text-slate-600">The latest horoscope from Haida Gwaii News.</p>
      </section>

      {loading ? (
        <p className="rounded-2xl border bg-white p-6">Loading horoscope…</p>
      ) : message ? (
        <p className="rounded-2xl border bg-white p-6 text-red-600">{message}</p>
      ) : horoscope ? (
        <article className="rounded-3xl border bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            {prettyDate(horoscope.horoscope_date)}
          </p>
          <h2 className="mt-3 text-3xl font-black text-hgnNavy">{horoscope.title || "Horoscope"}</h2>
          {horoscope.author_name ? <p className="mt-2 text-sm text-slate-500">By {horoscope.author_name}</p> : null}
          <div className="mt-6 whitespace-pre-wrap text-lg leading-8 text-slate-800">
            {horoscope.body || "Horoscope coming soon."}
          </div>
        </article>
      ) : (
        <p className="rounded-2xl border bg-white p-6">No horoscope has been published yet.</p>
      )}
    </main>
  )
}
