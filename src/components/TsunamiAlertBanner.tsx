"use client"

import { useEffect, useState } from "react"

type AlertData = {
  active: boolean
  title?: string
  summary?: string
  updatedLocal?: string
  reportUrl?: string
  error?: string
}

export default function TsunamiAlertBanner({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<AlertData | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const response = await fetch("/api/tsunami-alert", { cache: "no-store" })
        const json = await response.json()
        if (mounted) setData(json)
      } catch {
        if (mounted) {
          setData({
            active: false,
            title: "Tsunami alert status unavailable",
            summary: "Unable to load the live tsunami alert feed.",
          })
        }
      }
    }

    load()
    const interval = window.setInterval(load, 300000)

    return () => {
      mounted = false
      window.clearInterval(interval)
    }
  }, [])

  if (!data) return null

  if (data.active) {
    return (
      <section className="border-b border-red-950 bg-red-700 px-4 py-3 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-100">Tsunami Alert</p>
            <h2 className="text-lg font-black">{data.title || "Tsunami alert in effect"}</h2>
            {data.summary ? <p className="text-sm leading-6 text-red-50">{data.summary}</p> : null}
            {data.updatedLocal ? <p className="text-xs text-red-100">Updated {data.updatedLocal}</p> : null}
          </div>

          <a
            href={data.reportUrl || "https://weather.gc.ca/warnings/report_tsunami_e.html?mesoCode=tsu1"}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full bg-white px-5 py-2 text-sm font-black text-red-700"
          >
            Official Alert
          </a>
        </div>
      </section>
    )
  }

  // Site-wide banner should disappear when there is no alert.
  if (!compact) return null

  return (
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
      <p className="text-xs font-black uppercase tracking-[0.18em]">Tsunami Status</p>
      <h2 className="mt-2 text-2xl font-black">{data.title || "No tsunami alerts in effect"}</h2>
      {data.summary ? <p className="mt-2 text-sm leading-6">{data.summary}</p> : null}
      {data.updatedLocal ? <p className="mt-3 text-xs font-semibold">Feed updated {data.updatedLocal}</p> : null}
    </section>
  )
}
