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

const zodiacSigns = [
  { sign: "Aries", symbol: "♈", dates: "Mar 21 – Apr 19" },
  { sign: "Taurus", symbol: "♉", dates: "Apr 20 – May 20" },
  { sign: "Gemini", symbol: "♊", dates: "May 21 – Jun 20" },
  { sign: "Cancer", symbol: "♋", dates: "Jun 21 – Jul 22" },
  { sign: "Leo", symbol: "♌", dates: "Jul 23 – Aug 22" },
  { sign: "Virgo", symbol: "♍", dates: "Aug 23 – Sep 22" },
  { sign: "Libra", symbol: "♎", dates: "Sep 23 – Oct 22" },
  { sign: "Scorpio", symbol: "♏", dates: "Oct 23 – Nov 21" },
  { sign: "Sagittarius", symbol: "♐", dates: "Nov 22 – Dec 21" },
  { sign: "Capricorn", symbol: "♑", dates: "Dec 22 – Jan 19" },
  { sign: "Aquarius", symbol: "♒", dates: "Jan 20 – Feb 18" },
  { sign: "Pisces", symbol: "♓", dates: "Feb 19 – Mar 20" },
]

function prettyDate(value: string | null) {
  if (!value) return ""
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-CA", {
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
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="overflow-hidden rounded-[2rem] border bg-gradient-to-br from-slate-950 via-hgnNavy to-hgnBlue p-8 text-white shadow-sm md:p-10">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-white/70">Stars & sky</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight md:text-6xl">Horoscope</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
            Explore all twelve signs, then read the latest island horoscope below.
          </p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {zodiacSigns.map((item) => (
          <div key={item.sign} className="rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-2xl text-white">
                {item.symbol}
              </div>
              <div>
                <h3 className="text-lg font-black text-hgnNavy">{item.sign}</h3>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.dates}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {loading ? (
        <p className="rounded-2xl border bg-white p-6">Loading horoscope…</p>
      ) : message ? (
        <p className="rounded-2xl border bg-white p-6 text-red-600">{message}</p>
      ) : horoscope ? (
        <article className="rounded-[2rem] border bg-white p-8 shadow-sm md:p-10">
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
            {horoscope.horoscope_date ? <span>{prettyDate(horoscope.horoscope_date)}</span> : null}
            {horoscope.author_name ? <span>By {horoscope.author_name}</span> : null}
          </div>
          <h2 className="mt-3 text-3xl font-black text-hgnNavy md:text-4xl">{horoscope.title || "Latest horoscope"}</h2>
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
