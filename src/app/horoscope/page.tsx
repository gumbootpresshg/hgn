"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Ad = Record<string, any>

export default function HoroscopePage() {
  const [loading, setLoading] = useState(true)
  const [ad, setAd] = useState<Ad | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function load() {
      setLoading(true)
      setMessage("")

      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("placement_key", "horoscope")
        .eq("status", "active")
        .order("sort_order", { ascending: true })
        .limit(1)

      if (error) {
        setMessage(error.message)
      } else {
        setAd(data?.[0] || null)
      }

      setLoading(false)
    }

    load()
  }, [])

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <div className="text-sm font-semibold uppercase tracking-[0.25em] text-hgnBlue">
        Horoscope
      </div>

      <h1 className="mt-2 text-4xl font-black text-hgnNavy">Horoscope</h1>

      <p className="mt-2 text-slate-600">
        Discover what the stars have in store for you.
      </p>

      {loading ? (
        <p className="rounded-2xl border bg-white p-6">Loading…</p>
      ) : message ? (
        <p className="rounded-2xl border bg-white p-6 text-red-600">{message}</p>
      ) : ad ? (
        <article className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-black">{ad.title || "Horoscope"}</h2>

          {ad.description ? (
            <p className="mt-3 whitespace-pre-wrap text-lg text-slate-700">
              {ad.description}
            </p>
          ) : null}

          {ad.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ad.image_url}
              alt={ad.alt_text || ad.title || "Horoscope"}
              className="mx-auto mt-6 max-h-96 rounded-2xl object-contain"
            />
          ) : null}
        </article>
      ) : (
        <p className="rounded-2xl border bg-white p-6">
          No horoscope available at this time.
        </p>
      )}
    </main>
  )
}