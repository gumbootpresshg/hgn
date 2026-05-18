"use client"

import { useEffect, useState } from "react"

type TideResponse = {
  station?: {
    name: string
    stationCode: string
    officialUrl: string
  }
  nextHigh?: {
    localTime: string
    heightMetres: number
  } | null
  nextLow?: {
    localTime: string
    heightMetres: number
  } | null
  upcoming?: Array<{
    type: "High" | "Low"
    localTime: string
    heightMetres: number
  }>
  source?: string
  sourceUrl?: string
  error?: string
}

export default function LiveTideCards({ stationSlug, stationName }: { stationSlug: string; stationName: string }) {
  const [data, setData] = useState<TideResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const response = await fetch(`/api/tides/${stationSlug}`, { cache: "no-store" })
        const json = await response.json()
        if (!cancelled) setData(json)
      } catch (error: any) {
        if (!cancelled) setData({ error: error?.message || "Unable to load tide data" })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [stationSlug])

  if (loading) {
    return (
      <section className="grid gap-4 md:grid-cols-3">
        <Skeleton title="Next High Tide" />
        <Skeleton title="Next Low Tide" />
        <Skeleton title="Source" />
      </section>
    )
  }

  const hasLiveData = data?.nextHigh || data?.nextLow

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <TideCard
          label="Next High Tide"
          value={data?.nextHigh ? `${Number(data.nextHigh.heightMetres).toFixed(2)} m` : "Unavailable"}
          detail={data?.nextHigh?.localTime || "Official feed did not return a high tide estimate."}
        />
        <TideCard
          label="Next Low Tide"
          value={data?.nextLow ? `${Number(data.nextLow.heightMetres).toFixed(2)} m` : "Unavailable"}
          detail={data?.nextLow?.localTime || "Official feed did not return a low tide estimate."}
        />
        <TideCard
          label="Station"
          value={data?.station?.stationCode || stationName}
          detail={data?.source || "Canadian Hydrographic Service"}
        />
      </div>

      {data?.upcoming && data.upcoming.length > 0 ? (
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <h3 className="text-xl font-black">Upcoming tide changes</h3>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {data.upcoming.map((item, index) => (
              <div key={`${item.type}-${item.localTime}-${index}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <span className="font-black">{item.type}</span>
                <span>{item.localTime}</span>
                <span className="font-bold">{Number(item.heightMetres).toFixed(2)} m</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!hasLiveData || data?.error ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <strong>Live tide note:</strong>{" "}
          {data?.error || "The tide feed did not return enough prediction points for high/low estimates."}
          {" "}Use the official station link as backup.
        </div>
      ) : null}

      <p className="text-xs leading-5 text-slate-500">
        Tide predictions are pulled from the Canadian Hydrographic Service IWLS API and estimated from prediction points. Always verify with official tide tables before marine travel.
        {data?.sourceUrl ? (
          <>
            {" "}
            <a href={data.sourceUrl} target="_blank" rel="noreferrer" className="font-bold text-hgnBlue">
              Official station
            </a>
          </>
        ) : null}
      </p>
    </section>
  )
}

function TideCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-bold tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </article>
  )
}

function Skeleton({ title }: { title: string }) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-bold tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-black text-slate-300">Loading</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">Fetching official tide data…</p>
    </article>
  )
}
