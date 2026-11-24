"use client"

import { ChevronDown, ExternalLink, Wind, Waves, CloudRain, Snowflake, Thermometer, TriangleAlert, X } from "lucide-react"
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
  return new Intl.DateTimeFormat("en-CA", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Vancouver", timeZoneName: "short" }).format(date)
}

export default function WeatherAlertBar({ alert }: { alert: WeatherAlert }) {
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const communities = Array.isArray(alert.weather_communities) ? alert.weather_communities.filter((area) => area?.name) : []
  const dismissKey = `hgn-weather-alert-dismissed:${alert.id}`
  const endsAt = formatEndsAt(alert.ends_at)
  const label = alert.label || "Weather alert"
  const isWind = /^(?:strong |high |extreme )?wind\b/i.test(label.trim())
  const AlertIcon = /flood|storm surge|coastal inundation/i.test(label) ? Waves : isWind ? Wind : /snow|blizzard|freezing rain|ice/i.test(label) ? Snowflake : /rain/i.test(label) ? CloudRain : /heat|cold|temperature/i.test(label) ? Thermometer : TriangleAlert
  const summary = alert.weather_summary?.trim()
  const hasDetails = communities.some(area => area.timing || area.gusts || (area.steadyWind && area.steadyWind.trim() !== summary)) || communities.length > 1

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
    <section className="border-b border-amber-950/20 bg-amber-100 text-stone-950" aria-label={label}>
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:py-3">
        <div className="flex items-start gap-3">
          <AlertIcon className="mt-0.5 shrink-0 text-amber-800" size={21} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-amber-900">{alert.label || "Weather alert"}</span>
              <p className="text-sm font-bold leading-5 sm:text-[15px]">{alert.message}</p>
            </div>
            {alert.weather_summary ? <p className="mt-0.5 text-sm leading-5 text-stone-700">{alert.weather_summary}</p> : null}
            {endsAt ? <p className="mt-1 text-xs font-semibold text-stone-600">Current statement expires {endsAt}</p> : null}
          </div>
          <button type="button" onClick={dismiss} className="shrink-0 rounded p-1 text-stone-600 hover:bg-amber-200 hover:text-stone-950" aria-label="Dismiss weather alert for 12 hours">
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 pl-8 sm:pl-9">
          {hasDetails ? (
            <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="inline-flex items-center gap-1 text-sm font-black text-amber-950 underline decoration-amber-700/50 underline-offset-4 hover:text-stone-950">
              {open ? "Hide alert details" : "Alert details"}<ChevronDown className={open ? "rotate-180 transition-transform" : "transition-transform"} size={16} aria-hidden="true" />
            </button>
          ) : null}
          {alert.url ? <a href={alert.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-black text-amber-950 underline decoration-amber-700/50 underline-offset-4 hover:text-stone-950">{alert.source_name || "Official warning"}<ExternalLink size={14} aria-hidden="true" /></a> : null}
        </div>

        {open && hasDetails ? (
          <div className="mt-3 border-t border-amber-950/20 pt-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {communities.map((area, index) => (
                <div key={`${area.name}-${index}`} className="min-w-0 rounded border border-amber-950/15 p-3 text-sm leading-relaxed break-words">
                  {communities.length > 1 ? <p className="font-bold">{area.name}</p> : null}
                  <dl className="space-y-2">
                    {area.steadyWind && (area.steadyWind.trim() !== summary || (isWind && communities.length > 1)) ? <div><dt className="font-semibold">{isWind && /\d/.test(area.steadyWind) && /km\/h|kmh|kph/i.test(area.steadyWind) ? "Wind conditions" : "Hazard"}</dt><dd>{area.steadyWind}</dd></div> : null}
                    {isWind && area.gusts ? <div><dt className="font-semibold">Gusts</dt><dd>{area.gusts}</dd></div> : null}
                    {area.timing ? <div><dt className="font-semibold">Expected timing</dt><dd>{area.timing}</dd></div> : null}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
