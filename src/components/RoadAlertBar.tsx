"use client"

import { ChevronDown, ExternalLink, MapPin, X } from "lucide-react"
import { useEffect, useState } from "react"

type RoadAlert = {
  id: string
  label?: string | null
  message?: string | null
  weather_summary?: string | null
  source_name?: string | null
  url?: string | null
}

export default function RoadAlertBar({ alert }: { alert: RoadAlert }) {
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const dismissKey = `hgn-road-alert-dismissed:${alert.id}`

  useEffect(() => {
    try {
      const dismissedAt = Number(window.localStorage.getItem(dismissKey) || 0)
      setDismissed(Boolean(dismissedAt && Date.now() - dismissedAt < 60 * 60 * 1000))
    } catch {}
  }, [dismissKey])

  if (dismissed) return null
  const dismiss = () => {
    try { window.localStorage.setItem(dismissKey, String(Date.now())) } catch {}
    setDismissed(true)
  }

  return (
    <section className="border-b border-red-950/30 bg-red-800 text-white" aria-label="Road closure alert">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:py-3">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 shrink-0 text-red-100" size={21} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1"><span className="text-xs font-black uppercase tracking-[0.16em] text-red-100">{alert.label || "Road alert"}</span><p className="text-sm font-bold leading-5 sm:text-[15px]">{alert.message}</p></div>
          </div>
          <button type="button" onClick={dismiss} className="shrink-0 rounded p-1 text-red-100 hover:bg-red-700 hover:text-white" aria-label="Dismiss road alert for one hour"><X size={19} aria-hidden="true" /></button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 pl-8 sm:pl-9">
          <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="inline-flex items-center gap-1 text-sm font-black text-white underline decoration-red-200/80 underline-offset-4 hover:text-red-100">{open ? "Hide alert details" : "Alert details"}<ChevronDown className={open ? "rotate-180 transition-transform" : "transition-transform"} size={16} aria-hidden="true" /></button>
          {alert.url ? <a href={alert.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-black text-white underline decoration-red-200/80 underline-offset-4 hover:text-red-100">{alert.source_name || "DriveBC"}<ExternalLink size={14} aria-hidden="true" /></a> : null}
        </div>
        {open ? <div className="mt-3 border-t border-red-200/30 pt-3 pl-8 text-sm leading-6 text-red-50 sm:pl-9"><p>{alert.weather_summary || "DriveBC reports a major closure or disruption on Highway 16. Check the official source before travelling."}</p></div> : null}
      </div>
    </section>
  )
}
