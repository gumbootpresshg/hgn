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

type SignReading = { sign: string; body: string }

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

function signAnchor(sign: string) {
  return `sign-${sign.toLowerCase()}`
}

function readBySign(body: string | null): SignReading[] {
  if (!body?.trim()) return []

  const names = zodiacSigns.map((item) => item.sign).join("|")
  const matcher = new RegExp(`(?:^|\\n)\\s*(?:#{1,3}\\s*)?(?:\\*\\*)?(${names})(?:\\*\\*)?\\s*(?::|–|—|-)?\\s*`, "gi")
  const matches = Array.from(body.matchAll(matcher))

  return matches.map((match, index) => {
    const start = (match.index || 0) + match[0].length
    const end = index + 1 < matches.length ? matches[index + 1].index || body.length : body.length
    return { sign: match[1], body: body.slice(start, end).trim() }
  }).filter((item) => item.body.length > 0)
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

  const readings = readBySign(horoscope?.body || null)
  const publishedSigns = new Set(readings.map((item) => item.sign.toLowerCase()))

  return (
    <main className="min-h-[62vh] bg-[radial-gradient(circle_at_top_left,_rgba(30,95,148,.13),_transparent_32rem)]">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
      <section className="overflow-hidden rounded-[2rem] border border-hgnNavy bg-gradient-to-br from-[#10243b] via-hgnNavy to-hgnBlue p-7 text-white shadow-[0_18px_45px_rgba(16,36,59,.22)] md:p-10">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">Stars & sky</p>
          <h1 className="mt-3 font-serif text-5xl font-bold tracking-tight md:text-6xl">Horoscopes</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
            Choose your sign to jump straight to today’s reading, or settle in and read them all.
          </p>
        </div>
      </section>

      <section aria-label="Choose your sign" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {zodiacSigns.map((item) => (
          <a key={item.sign} href={`#${signAnchor(item.sign)}`} className={`rounded-2xl border p-4 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-hgnBlue hover:shadow-md focus:outline-none focus:ring-2 focus:ring-hgnBlue/50 ${publishedSigns.has(item.sign.toLowerCase()) ? "border-stone-300 bg-white/75" : "border-stone-200 bg-white/45 opacity-75"}`}>
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-hgnNavy text-xl text-white shadow-sm">
                {item.symbol}
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-hgnNavy">{item.sign}</h3>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{item.dates}</p>
              </div>
            </div>
          </a>
        ))}
      </section>

      {loading ? (
        <p className="rounded-2xl border bg-white p-6">Loading horoscope…</p>
      ) : message ? (
        <p className="rounded-2xl border bg-white p-6 text-red-600">{message}</p>
      ) : horoscope ? (
        <article id="latest-reading" className="rounded-[2rem] border border-stone-300 bg-white/80 p-6 shadow-sm backdrop-blur-sm md:p-10">
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
            {horoscope.horoscope_date ? <span>{prettyDate(horoscope.horoscope_date)}</span> : null}
            {horoscope.author_name ? <span>By {horoscope.author_name}</span> : null}
          </div>
          <h2 className="mt-3 font-serif text-3xl font-bold text-hgnNavy md:text-4xl">{horoscope.title || "Latest horoscope"}</h2>
          {readings.length ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {readings.map((reading) => {
                const sign = zodiacSigns.find((item) => item.sign.toLowerCase() === reading.sign.toLowerCase())
                return <section id={signAnchor(reading.sign)} key={reading.sign} className="scroll-mt-24 rounded-2xl border border-stone-200 bg-[#fffefa]/90 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-hgnNavy text-lg text-white">{sign?.symbol}</span>
                    <div><h3 className="font-serif text-2xl font-bold text-hgnNavy">{reading.sign}</h3><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{sign?.dates}</p></div>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-700">{reading.body}</p>
                </section>
              })}
            </div>
          ) : (
            <div className="mt-6 whitespace-pre-wrap text-lg leading-8 text-slate-800">{horoscope.body || "Horoscope coming soon."}</div>
          )}
        </article>
      ) : (
        <p className="rounded-2xl border bg-white p-6">No horoscope has been published yet.</p>
      )}
      </div>
    </main>
  )
}
