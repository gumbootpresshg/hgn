"use client"

import { ChevronDown, Wind, X } from "lucide-react"
import { useEffect, useState } from "react"

export type WeatherAlertCommunity = {
  name: string
  steadyWind?: string
  gusts?: string
  timing?: string
}

export type WeatherAlert = {
  id: string
  label?: string | null
  message?: string | null
  weather_summary?: string | null
  weather_communities?: WeatherAlertCommunity[] | null
  url?: string | null
  source_name?: string | null
  ends_at?: string | null
}

function formatEndsAt(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat("en-CA", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(date)
}

export default function WeatherAlertBar({ alert }: { alert: WeatherAlert }) {
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const communities = Array.isArray(alert.weather_communities) ? alert.weather_communities.filter((area) => area?.name) : []
  const hasWindMeasurements = communities.some((area) => /\b\d{1,3}\s*(?:km\/?h|kph|kmh|knots?)\b/i.test(`${area.steadyWind || ""} ${area.gusts || ""}`))
  const dismissKey = `hgn-weather-alert-dismissed:${alert.id}`
  const endsAt = formatEndsAt(alert.ends_at)

  useEffect(() => {
    try {
      const dismissedAt = Number(window.localStorage.getItem(dismissKey) || 0)
      setDismissed(Boolean(dismissedAt && Date.now() - dismissedAt < 12 * 60 * 60 * 1000))
    } catch {}
  }, [dismissKey])

  if (dismissed) return null

  const dismiss = () => {
    try { window.localStorage.setItem(dismissKey, String(Date.now())) } catch {}
    setDismissed(true)
  }

  return (
    <section className="border-b border-amber-950/20 bg-amber-100 text-stone-950" aria-label="Weather warning">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:py-3">
        <div className="flex items-start gap-3">
          <Wind className="mt-0.5 shrink-0 text-amber-800" size={21} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-amber-900">{alert.label || "Weather alert"}</span>
              <p className="text-sm font-bold leading-5 sm:text-[15px]">{alert.message}</p>
            </div>
            {alert.weather_summary ? <p className="mt-0.5 text-sm leading-5 text-stone-700">{alert.weather_summary}</p> : null}
            {endsAt ? <p className="mt-1 text-xs font-semibold text-stone-600">In effect until {endsAt}</p> : null}
          </div>
          <button type="button" onClick={dismiss} className="shrink-0 rounded p-1 text-stone-600 hover:bg-amber-200 hover:text-stone-950" aria-label="Dismiss weather alert for 12 hours">
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 pl-8 sm:pl-9">
          {communities.length ? (
            <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="inline-flex items-center gap-1 text-sm font-black text-amber-950 underline decoration-amber-700/50 underline-offset-4 hover:text-stone-950">
              {open ? "Hide alert details" : hasWindMeasurements ? "Wind details" : "Alert details"}<ChevronDown className={open ? "rotate-180 transition-transform" : "transition-transform"} size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {open && communities.length && hasWindMeasurements ? (
          <div className="mt-3 overflow-x-auto border-t border-amber-950/20 pt-3 pl-8 sm:pl-9">
            <table className="min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.1em] text-stone-600">
                <tr><th className="pb-1.5 pr-6 font-black">Area</th><th className="pb-1.5 pr-6 font-black">Steady wind</th><th className="pb-1.5 pr-6 font-black">Gusts</th><th className="pb-1.5 font-black">Timing</th></tr>
              </thead>
              <tbody>
                {communities.map((area, index) => <tr key={`${area.name}-${index}`} className="border-t border-amber-950/10"><td className="py-2 pr-6 font-bold">{area.name}</td><td className="py-2 pr-6">{area.steadyWind || "—"}</td><td className="py-2 pr-6">{area.gusts || "—"}</td><td className="py-2">{area.timing || "—"}</td></tr>)}
              </tbody>
            </table>
          </div>
        ) : null}
        {open && communities.length && !hasWindMeasurements ? (
          <div className="mt-3 grid gap-4 border-t border-amber-950/20 pt-3 pl-8 text-sm sm:grid-cols-2 sm:pl-9">
            {communities.map((area, index) => <div key={`${area.name}-${index}`}><p className="text-xs font-black uppercase tracking-[0.12em] text-stone-600">Affected area</p><p className="mt-1 font-bold text-stone-950">{area.name}</p>{area.timing ? <><p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-stone-600">Timing</p><p className="mt-1 leading-6 text-stone-800">{area.timing}</p></> : null}</div>)}
          </div>
        ) : null}
      </div>
    </section>
  )
}
