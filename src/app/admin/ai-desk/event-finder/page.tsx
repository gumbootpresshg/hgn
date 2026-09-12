"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"

type Source = {
  id: string
  name: string
  url: string
  community: string | null
  active: boolean
  last_checked_at: string | null
  last_status: string
  last_error: string | null
  quality_score?: number | null
  max_candidates?: number | null
  last_candidate_count?: number | null
  last_duplicate_count?: number | null
}

async function headers(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function localDate(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d)
}

export default function EventFinder() {
  const [sources, setSources] = useState<Source[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const activeSources = useMemo(() => sources.filter((s) => s.active), [sources])

  async function load() {
    const response = await fetch("/api/ai-desk/event-scan", { cache: "no-store", headers: await headers() })
    const data = await response.json()
    setMessage(response.ok ? "" : data.error)
    setSources(data.sources || [])
    setSelected((data.sources || []).filter((x: Source) => x.active).map((x: Source) => x.id))
  }

  useEffect(() => { void load() }, [])

  async function scan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    const form = new FormData(event.currentTarget)
    const response = await fetch("/api/ai-desk/event-scan", {
      method: "POST",
      headers: { ...(await headers()), "Content-Type": "application/json" },
      body: JSON.stringify({ start_date: form.get("start_date"), end_date: form.get("end_date"), source_ids: selected }),
    })
    const data = await response.json()
    setMessage(response.ok
      ? `${data.found} research candidates added. ${data.duplicates} likely duplicates skipped. ${data.failed} sources failed.`
      : data.error)
    setBusy(false)
    await load()
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const response = await fetch("/api/ai-desk/event-scan", {
      method: "POST",
      headers: { ...(await headers()), "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add_source", name: form.get("name"), url: form.get("url"), community: form.get("community") }),
    })
    const data = await response.json()
    setMessage(response.ok ? "Event source added." : data.error)
    if (response.ok) event.currentTarget.reset()
    await load()
  }

  async function updateSource(source: Source, changes: Partial<Source>) {
    const next = { ...source, ...changes }
    const response = await fetch("/api/ai-desk/event-scan", {
      method: "POST",
      headers: { ...(await headers()), "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_source",
        id: source.id,
        active: next.active,
        quality_score: next.quality_score ?? 0.5,
        max_candidates: next.max_candidates ?? 8,
      }),
    })
    const data = await response.json().catch(() => ({}))
    setMessage(response.ok ? "Source settings saved." : data.error || "Could not save source.")
    await load()
  }

  return <main className="mx-auto max-w-6xl space-y-7 px-5 py-9">
    <header className="rounded-3xl border bg-slate-950 p-8 text-white">
      <Link href="/admin/ai-desk" className="font-black text-blue-300">← AI Desk</Link>
      <h1 className="mt-3 font-serif text-5xl font-bold">Event Finder</h1>
      <p className="mt-3 max-w-3xl text-slate-300">Research approved community and official sources for possible events. Findings stay in AI Research until a staff member verifies and promotes them. Nothing enters the public Submissions queue automatically.</p>
    </header>

    {message && <p className="rounded-2xl border bg-white p-4 font-bold">{message}</p>}

    <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <form onSubmit={scan} className="grid content-start gap-4 rounded-3xl border bg-white p-6">
        <div>
          <h2 className="font-serif text-3xl font-bold">Run event research</h2>
          <p className="mt-2 text-sm text-slate-600">The scanner now limits noisy sources, scores confidence from real event signals, and keeps low-confidence fragments out of the desk.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>Start date<input name="start_date" type="date" required defaultValue={localDate(0)} /></label>
          <label>End date<input name="end_date" type="date" required defaultValue={localDate(90)} /></label>
        </div>
        <fieldset>
          <legend className="font-black">Sources</legend>
          <div className="mt-3 grid gap-2">
            {activeSources.map((source) => <label key={source.id} className="flex gap-3 rounded-xl border p-3">
              <input type="checkbox" checked={selected.includes(source.id)} onChange={(e) => setSelected((value) => e.target.checked ? [...value, source.id] : value.filter((x) => x !== source.id))} />
              <span>
                <strong>{source.name}</strong>
                <small className="block text-slate-500">{source.community || "All islands"} · quality {Math.round(Number(source.quality_score ?? .5) * 100)}% · max {source.max_candidates || 8}</small>
                <small className="block text-slate-500">Last scan: {source.last_candidate_count || 0} candidates · {source.last_duplicate_count || 0} duplicates</small>
                {source.last_error && <small className="block text-red-700">{source.last_error}</small>}
              </span>
            </label>)}
          </div>
        </fieldset>
        <button disabled={busy || !selected.length} className="hgn-btn-primary">{busy ? "Researching sources…" : "Research possible events"}</button>
      </form>

      <form onSubmit={add} className="grid content-start gap-3 rounded-3xl border bg-white p-6">
        <h2 className="font-serif text-3xl font-bold">Add event source</h2>
        <input name="name" required placeholder="Source name" />
        <input name="url" type="url" required placeholder="https://..." />
        <input name="community" placeholder="Community, optional" />
        <button className="rounded-full border px-5 py-3 font-black">Save source</button>
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <strong>Best sources</strong>
          <p className="mt-2">Municipal calendars, community organizations, fairs, museums, schools, recreation groups and official event pages with clear dates and locations.</p>
        </div>
      </form>
    </section>

    <section className="rounded-3xl border bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl font-bold">Source quality</h2>
          <p className="mt-1 text-sm text-slate-600">Disable noisy sources or lower their candidate cap instead of letting them flood AI Research.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {sources.map((source) => <div key={source.id} className="grid gap-3 rounded-2xl border p-4 md:grid-cols-[1fr_150px_150px_auto] md:items-end">
          <div>
            <strong>{source.name}</strong>
            <a href={source.url} target="_blank" rel="noreferrer" className="block truncate text-sm text-hgnBlue">{source.url}</a>
            <small className="text-slate-500">{source.last_status.replaceAll("_", " ")}{source.last_checked_at ? ` · ${new Date(source.last_checked_at).toLocaleString()}` : ""}</small>
          </div>
          <label className="grid gap-1 text-sm font-black">Quality
            <select defaultValue={String(source.quality_score ?? .5)} onChange={(e) => void updateSource(source, { quality_score: Number(e.target.value) })}>
              <option value="0.3">Poor</option><option value="0.5">Average</option><option value="0.7">Good</option><option value="0.9">Excellent</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-black">Max candidates
            <select defaultValue={String(source.max_candidates || 8)} onChange={(e) => void updateSource(source, { max_candidates: Number(e.target.value) })}>
              <option value="3">3</option><option value="5">5</option><option value="8">8</option><option value="10">10</option><option value="12">12</option>
            </select>
          </label>
          <button onClick={() => void updateSource(source, { active: !source.active })} className="rounded-full border px-4 py-2 text-sm font-black" type="button">{source.active ? "Disable" : "Enable"}</button>
        </div>)}
      </div>
    </section>
  </main>
}
