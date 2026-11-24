"use client"

import { FormEvent, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const empty = {
  label: "WIND WARNING", kind: "weather", message: "", weather_summary: "", community_lines: "",
  url: "https://weather.gc.ca/warnings/index_e.html?prov=bc", source_name: "Environment Canada",
  priority: 10, status: "active", starts_at: "", ends_at: "",
}

function parseCommunities(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [name = "", steadyWind = "", gusts = "", timing = ""] = line.split("|").map((part) => part.trim())
    return { name, steadyWind, gusts, timing }
  }).filter((area) => area.name)
}

function communityLines(value: unknown) {
  if (!Array.isArray(value)) return ""
  return value.map((area: any) => [area.name, area.steadyWind, area.gusts, area.timing].filter((part) => part !== undefined && part !== "").join(" | ")).join("\n")
}

export default function AdminAlerts() {
  const [rows, setRows] = useState<any[]>([])
  const [form, setForm] = useState(empty)
  const [msg, setMsg] = useState("")
  const [saving, setSaving] = useState(false)
  const isWeather = form.kind === "weather"

  async function load() {
    const { data, error } = await supabase.from("site_alerts").select("*").order("created_at", { ascending: false })
    if (error) setMsg(error.message)
    setRows(data || [])
  }

  useEffect(() => { load() }, [])

  async function save(event: FormEvent) {
    event.preventDefault()
    setMsg("")
    setSaving(true)
    const payload: Record<string, unknown> = {
      label: form.label.trim(), kind: form.kind, message: form.message.trim(), url: form.url.trim() || null,
      priority: form.priority, status: form.status, starts_at: form.starts_at || null, ends_at: form.ends_at || null,
      weather_summary: isWeather ? form.weather_summary.trim() || null : null,
      weather_communities: isWeather ? parseCommunities(form.community_lines) : [],
      source_name: isWeather ? form.source_name.trim() || null : null,
    }
    const { error } = await supabase.from("site_alerts").insert(payload)
    setSaving(false)
    if (error) {
      setMsg(error.message.includes("weather_summary") || error.message.includes("weather_communities") || error.message.includes("source_name") ? "Run supabase/v320-weather-alert-details.sql first, then publish this alert." : error.message)
      return
    }
    setForm(empty)
    setMsg("Alert published. It will only appear during its active time window.")
    load()
  }

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("site_alerts").update({ status }).eq("id", id)
    if (error) setMsg(error.message)
    else load()
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-hgnRed">Reader safety</p>
      <h1 className="mt-2 text-4xl font-black text-hgnNavy sm:text-5xl">Weather & Site Alerts</h1>
      <p className="mt-3 max-w-3xl text-slate-600">Environment Canada wind warnings for Haida Gwaii are refreshed automatically. This desk is for other site alerts and for any manual weather update you need to publish.</p>
      {msg ? <div className="mt-4 border border-amber-300 bg-amber-50 p-4 font-semibold text-amber-950">{msg}</div> : null}

      <form onSubmit={save} className="hgn-card mt-6 grid gap-4 p-5 sm:p-6 md:grid-cols-2">
        <label className="text-sm font-bold text-slate-700">Alert type
          <select className="hgn-input mt-1 w-full" value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value, label: event.target.value === "weather" ? "WIND WARNING" : form.label })}>
            <option value="weather">Weather warning</option><option value="breaking">Breaking</option><option value="ferry">Ferry</option><option value="community">Community</option>
          </select>
        </label>
        <label className="text-sm font-bold text-slate-700">Label
          <input className="hgn-input mt-1 w-full" required placeholder="e.g. WIND WARNING" value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} />
        </label>
        <label className="text-sm font-bold text-slate-700 md:col-span-2">Headline readers see
          <input className="hgn-input mt-1 w-full" required placeholder="e.g. Strong southeast winds expected across Haida Gwaii." value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
        </label>
        {isWeather ? <>
          <label className="text-sm font-bold text-slate-700 md:col-span-2">Plain-language summary
            <input className="hgn-input mt-1 w-full" placeholder="e.g. Winds 60 km/h, gusting to 90 km/h. Travel may be affected." value={form.weather_summary} onChange={(event) => setForm({ ...form, weather_summary: event.target.value })} />
          </label>
          <label className="text-sm font-bold text-slate-700 md:col-span-2">Community conditions <span className="font-normal text-slate-500">(optional, one per line: area | steady wind | gusts | timing)</span>
            <textarea className="hgn-input mt-1 min-h-32 w-full" placeholder={"Masset / Old Massett | 60 km/h | 90 km/h | Overnight to Tuesday morning\nDaajing Giids / Skidegate | 50 km/h | 80 km/h | Late Monday to Tuesday"} value={form.community_lines} onChange={(event) => setForm({ ...form, community_lines: event.target.value })} />
          </label>
          <label className="text-sm font-bold text-slate-700">Official source label
            <input className="hgn-input mt-1 w-full" value={form.source_name} onChange={(event) => setForm({ ...form, source_name: event.target.value })} />
          </label>
        </> : null}
        <label className="text-sm font-bold text-slate-700">Official link
          <input className="hgn-input mt-1 w-full" type="url" placeholder="https://" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} />
        </label>
        <label className="text-sm font-bold text-slate-700">Starts <span className="font-normal text-slate-500">(leave blank for now)</span>
          <input className="hgn-input mt-1 w-full" type="datetime-local" value={form.starts_at} onChange={(event) => setForm({ ...form, starts_at: event.target.value })} />
        </label>
        <label className="text-sm font-bold text-slate-700">Ends <span className="font-normal text-slate-500">(recommended)</span>
          <input className="hgn-input mt-1 w-full" type="datetime-local" value={form.ends_at} onChange={(event) => setForm({ ...form, ends_at: event.target.value })} />
        </label>
        <label className="text-sm font-bold text-slate-700">Priority
          <input className="hgn-input mt-1 w-full" type="number" min="1" max="100" value={form.priority} onChange={(event) => setForm({ ...form, priority: Number(event.target.value) })} />
        </label>
        <button disabled={saving} className="hgn-btn-primary self-end md:col-span-2">{saving ? "Publishing…" : "Publish alert"}</button>
      </form>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Alert history</h2>
        <div className="mt-4 grid gap-4">
          {rows.map((row) => <article key={row.id} className="hgn-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-hgnBlue">{row.status} · {row.kind}{row.automated ? " · automatic" : ""}</p><h3 className="mt-1 text-xl font-black text-hgnNavy">{row.label}: {row.message}</h3>{row.weather_summary ? <p className="mt-2 text-slate-600">{row.weather_summary}</p> : null}{Array.isArray(row.weather_communities) && row.weather_communities.length ? <p className="mt-2 text-sm text-slate-500">Community details: {communityLines(row.weather_communities).replace(/\n/g, " · ")}</p> : null}<p className="mt-2 text-sm text-slate-500">{row.starts_at || "now"} → {row.ends_at || "open"}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setStatus(row.id, "active")} className="hgn-btn-primary">Active</button><button type="button" onClick={() => setStatus(row.id, "paused")} className="hgn-btn-dark">Pause</button><button type="button" onClick={() => setStatus(row.id, "expired")} className="hgn-btn border border-stone-300 bg-white">Expire</button></div></div>
          </article>)}
        </div>
      </section>
    </main>
  )
}
