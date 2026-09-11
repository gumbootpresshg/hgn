"use client"

import { useEffect, useState } from "react"

type EarthquakeData = {
  active: boolean
  alert?: {
    magnitude?: number
    place?: string
    localTime?: string
    url?: string
    depthKm?: number
  } | null
  events?: Array<{
    id: string
    magnitude?: number
    place?: string
    localTime?: string
    url?: string
    depthKm?: number
  }>
  error?: string
}

export default function EarthquakeAlertBanner({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<EarthquakeData | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const response = await fetch("/api/earthquake-alert", { cache: "no-store" })
        const json = await response.json()
        if (mounted) setData(json)
      } catch {
        if (mounted) setData({ active: false, events: [], error: "Unable to load earthquake feed" })
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

  if (data.active && data.alert) {
    return (
      <section className="border-b border-amber-950 bg-amber-600 px-4 py-3 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-100">Recent Earthquake</p>
            <h2 className="text-lg font-black">
              M{Number(data.alert.magnitude || 0).toFixed(1)} · {data.alert.place || "Near Haida Gwaii"}
            </h2>
            <p className="text-sm leading-6 text-amber-50">
              {data.alert.localTime}
              {typeof data.alert.depthKm === "number" ? ` · ${Number(data.alert.depthKm).toFixed(1)} km deep` : ""}
            </p>
          </div>

          {data.alert.url ? (
            <a href={data.alert.url} target="_blank" rel="noreferrer" className="shrink-0 rounded-full bg-white px-5 py-2 text-sm font-black text-amber-700">
              Official Details
            </a>
          ) : null}
        </div>
      </section>
    )
  }

  if (!compact) return null

  const recent = data.events?.slice(0, 5) || []

  return (
    <section className="rounded-3xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">Earthquake Status</p>
      <h2 className="mt-2 text-2xl font-black">Recent regional earthquakes</h2>
      {data.error ? <p className="mt-2 text-sm text-amber-700">{data.error}</p> : null}
      {recent.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">No recent regional earthquake data returned.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {recent.map((event) => (
            <a key={event.id} href={event.url || "#"} target="_blank" rel="noreferrer" className="block rounded-2xl bg-slate-50 p-4 hover:bg-slate-100">
              <p className="font-black">M{Number(event.magnitude || 0).toFixed(1)} · {event.place}</p>
              <p className="mt-1 text-xs text-slate-500">{event.localTime}</p>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
