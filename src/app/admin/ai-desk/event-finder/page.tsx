"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Radar, RefreshCw, Settings2, ShieldCheck } from "lucide-react"
import { supabase } from "@/lib/supabase"

type Settings = {
  enabled: boolean
  publication_area: string
  communities: string[]
  event_types: string[]
  organizations: string[]
  custom_terms: string[]
  excluded_terms: string[]
  lookahead_days: number
}

type Source = {
  id: string
  name: string
  url: string
  active: boolean
  source_lifecycle?: string
  review_status?: string
  auto_managed?: boolean
  quality_score?: number | null
  last_checked_at?: string | null
  last_status?: string | null
  last_candidate_count?: number | null
  consecutive_failures?: number | null
  last_useful_at?: string | null
}

const defaults: Settings = {
  enabled: true,
  publication_area: "Haida Gwaii",
  communities: ["Masset", "Old Massett", "Port Clements", "Tlell", "Skidegate", "Daajing Giids", "Sandspit", "Moresby Island", "Graham Island"],
  event_types: ["community events", "festivals", "markets", "fundraisers", "sports", "school events", "arts", "concerts", "workshops", "meetings", "recreation", "fairs", "cultural events", "business events"],
  organizations: ["Village of Masset", "Village of Daajing Giids", "Village of Port Clements", "Old Massett Village Council", "Skidegate Band Council", "School District 50", "Haida Heritage Centre"],
  custom_terms: [],
  excluded_terms: [],
  lookahead_days: 90,
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function lines(value: string) {
  return value.split(/\r?\n|,/).map((x) => x.trim()).filter(Boolean)
}

function joined(value: string[]) { return value.join("\n") }

export default function EventFinder() {
  const [settings, setSettings] = useState<Settings>(defaults)
  const [sources, setSources] = useState<Source[]>([])
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [showCoverage, setShowCoverage] = useState(false)
  const [showSources, setShowSources] = useState(false)

  const usefulSources = useMemo(() => sources.filter((source) => source.active && source.review_status === "approved"), [sources])
  const autoSources = useMemo(() => sources.filter((source) => source.auto_managed), [sources])
  const trustedSources = useMemo(() => sources.filter((source) => source.source_lifecycle === "trusted" && source.active), [sources])

  async function load() {
    const response = await fetch("/api/ai-desk/event-scan", { cache: "no-store", headers: await authHeaders() })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) { setMessage(data.error || "Could not load Event Finder."); return }
    setSettings({ ...defaults, ...(data.settings || {}) })
    setSources(data.sources || [])
  }

  useEffect(() => { void load() }, [])

  async function findNow() {
    setBusy(true)
    setMessage("Searching local sources and the wider web for upcoming events…")
    const response = await fetch("/api/ai-desk/event-scan", {
      method: "POST",
      headers: { ...(await authHeaders()), "Content-Type": "application/json" },
      body: JSON.stringify({ action: "find_events_now" }),
    })
    const data = await response.json().catch(() => ({}))
    if (response.ok) {
      setMessage(`${data.found || 0} possible events found. ${data.duplicates || 0} duplicates skipped. Checked ${data.pages_checked || 0} pages from ${data.searches || 0} searches. ${data.new_sources || 0} new sources learned.`)
    } else setMessage(data.error || "Event search could not complete.")
    setBusy(false)
    await load()
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    const form = new FormData(event.currentTarget)
    const next: Settings = {
      enabled: form.get("enabled") === "on",
      publication_area: String(form.get("publication_area") || "").trim(),
      communities: lines(String(form.get("communities") || "")),
      event_types: lines(String(form.get("event_types") || "")),
      organizations: lines(String(form.get("organizations") || "")),
      custom_terms: lines(String(form.get("custom_terms") || "")),
      excluded_terms: lines(String(form.get("excluded_terms") || "")),
      lookahead_days: Number(form.get("lookahead_days") || 90),
    }
    const response = await fetch("/api/ai-desk/event-scan", {
      method: "POST",
      headers: { ...(await authHeaders()), "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save_settings", settings: next }),
    })
    const data = await response.json().catch(() => ({}))
    if (response.ok) { setSettings(data.settings || next); setMessage("Coverage settings saved. Future automatic searches will use them.") }
    else setMessage(data.error || "Could not save coverage settings.")
    setBusy(false)
  }

  async function sourceAction(source: Source, lifecycle: "trusted" | "watch" | "ignored") {
    const response = await fetch("/api/ai-desk/event-scan", {
      method: "POST",
      headers: { ...(await authHeaders()), "Content-Type": "application/json" },
      body: JSON.stringify({ action: "review_source", id: source.id, source_lifecycle: lifecycle }),
    })
    const data = await response.json().catch(() => ({}))
    setMessage(response.ok ? `Source marked ${lifecycle}.` : data.error || "Could not update source.")
    await load()
  }

  return <main className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6">
    <header className="rounded-3xl border bg-slate-950 p-7 text-white shadow-sm sm:p-9">
      <Link href="/admin/ai-desk" className="font-black text-blue-300">← AI Desk</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-blue-300">Automatic local discovery</p>
          <h1 className="mt-2 font-serif text-5xl font-bold">Event Finder</h1>
          <p className="mt-3 text-slate-300">HGN searches known local sources and the wider web automatically. Editors review the events it finds. You do not need to build or maintain a source list.</p>
        </div>
        <button type="button" disabled={busy} onClick={() => void findNow()} className="hgn-btn-primary !bg-white !text-slate-950 disabled:opacity-50">
          <Radar className="mr-2 inline" size={17} />{busy ? "Searching…" : "Find events now"}
        </button>
      </div>
    </header>

    {message && <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 font-bold text-slate-800">{message}</p>}

    <section className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Coverage</p><strong className="mt-2 block font-serif text-2xl">{settings.publication_area}</strong><p className="mt-1 text-sm text-slate-600">{settings.communities.length} communities configured</p></div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Sources learned</p><strong className="mt-2 block font-serif text-2xl">{autoSources.length}</strong><p className="mt-1 text-sm text-slate-600">{trustedSources.length} manually trusted · {usefulSources.length} active</p></div>
      <div className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Automatic search</p><strong className="mt-2 block font-serif text-2xl">{settings.enabled ? "On" : "Off"}</strong><p className="mt-1 text-sm text-slate-600">Looks ahead {settings.lookahead_days} days</p></div>
    </section>

    <section className="rounded-3xl border bg-emerald-50 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-800">How it works</p><h2 className="mt-2 font-serif text-3xl font-bold">You review events. HGN handles the searching.</h2><p className="mt-2 leading-7 text-slate-700">The system searches communities, event types, organizations and venues, remembers useful sources, checks one-off event pages, skips duplicates, and puts possible events into AI Desk for staff review. Nothing publishes automatically.</p></div>
        <Link href="/admin/ai-desk?type=event" className="hgn-btn-primary">Review events found →</Link>
      </div>
    </section>

    <section className="rounded-3xl border bg-white shadow-sm">
      <button type="button" onClick={() => setShowCoverage((value) => !value)} className="flex w-full items-center justify-between gap-4 p-6 text-left">
        <span><span className="text-xs font-black uppercase tracking-widest text-hgnBlue">Publisher setup</span><strong className="mt-1 block font-serif text-2xl">Coverage settings</strong><span className="mt-1 block text-sm font-normal text-slate-600">Set this once, then let Event Finder work automatically.</span></span>
        {showCoverage ? <ChevronUp /> : <ChevronDown />}
      </button>
      {showCoverage && <form onSubmit={saveSettings} className="grid gap-5 border-t p-6 lg:grid-cols-2">
        <label className="grid gap-2 font-bold lg:col-span-2">Publication / coverage area<input name="publication_area" defaultValue={settings.publication_area} required placeholder="Haida Gwaii" /><span className="text-xs font-normal text-slate-500">The broad place Event Finder should understand as home territory.</span></label>
        <label className="grid gap-2 font-bold">Communities<textarea name="communities" rows={10} defaultValue={joined(settings.communities)} /><span className="text-xs font-normal text-slate-500">One per line. Used to generate local searches and identify locations.</span></label>
        <label className="grid gap-2 font-bold">What to look for<textarea name="event_types" rows={10} defaultValue={joined(settings.event_types)} /><span className="text-xs font-normal text-slate-500">Events, sports, markets, school events, arts, meetings and other useful categories.</span></label>
        <label className="grid gap-2 font-bold">Organizations & venues<textarea name="organizations" rows={8} defaultValue={joined(settings.organizations)} /><span className="text-xs font-normal text-slate-500">Groups worth searching by name. HGN can still discover others on its own.</span></label>
        <label className="grid gap-2 font-bold">Also watch for<textarea name="custom_terms" rows={8} defaultValue={joined(settings.custom_terms)} placeholder="ferry open house\nfall fair\nyouth hockey" /><span className="text-xs font-normal text-slate-500">Optional special topics or seasonal searches.</span></label>
        <label className="grid gap-2 font-bold">Ignore terms<textarea name="excluded_terms" rows={5} defaultValue={joined(settings.excluded_terms)} placeholder="Vancouver\nPrince Rupert" /></label>
        <label className="grid gap-2 font-bold">Look ahead<input name="lookahead_days" type="number" min="14" max="180" defaultValue={settings.lookahead_days} /><span className="text-xs font-normal text-slate-500">Days into the future to search for events.</span></label>
        <label className="flex items-center gap-3 rounded-2xl border p-4 font-bold lg:col-span-2"><input name="enabled" type="checkbox" defaultChecked={settings.enabled} />Automatically search for events every day</label>
        <button disabled={busy} className="hgn-btn-primary lg:col-span-2"><Settings2 className="mr-2 inline" size={17} />Save coverage settings</button>
      </form>}
    </section>

    <section className="rounded-3xl border bg-white shadow-sm">
      <button type="button" onClick={() => setShowSources((value) => !value)} className="flex w-full items-center justify-between gap-4 p-6 text-left">
        <span><span className="text-xs font-black uppercase tracking-widest text-slate-400">Advanced</span><strong className="mt-1 block font-serif text-2xl">Source health</strong><span className="mt-1 block text-sm font-normal text-slate-600">Normally you can ignore this. Use it only to trust or block a source manually.</span></span>
        {showSources ? <ChevronUp /> : <ChevronDown />}
      </button>
      {showSources && <div className="border-t p-6">
        {sources.length === 0 ? <p className="text-slate-600">No sources learned yet. Run Find events now and the system will build this list itself.</p> : <div className="grid gap-3">
          {sources.map((source) => <article key={source.id} className="rounded-2xl border p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <div><div className="flex flex-wrap items-center gap-2"><strong>{source.name}</strong>{source.auto_managed && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-black text-blue-800">Auto-managed</span>}{source.source_lifecycle === "trusted" && <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-800"><ShieldCheck className="mr-1 inline" size={12}/>Trusted</span>}</div><a href={source.url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-sm text-hgnBlue">{source.url}</a><p className="mt-2 text-xs text-slate-500">Quality {Math.round(Number(source.quality_score || 0) * 100)}% · Last scan {source.last_status || "not yet"} · Last found {source.last_candidate_count || 0}</p></div>
              <div className="flex flex-wrap gap-2"><button type="button" onClick={() => void sourceAction(source, "trusted")} className="rounded-full border px-3 py-2 text-xs font-black">Trust</button><button type="button" onClick={() => void sourceAction(source, "watch")} className="rounded-full border px-3 py-2 text-xs font-black"><RefreshCw className="mr-1 inline" size={12}/>Auto-manage</button><button type="button" onClick={() => void sourceAction(source, "ignored")} className="rounded-full border px-3 py-2 text-xs font-black text-red-700">Ignore</button></div>
            </div>
          </article>)}
        </div>}
      </div>}
    </section>
  </main>
}
