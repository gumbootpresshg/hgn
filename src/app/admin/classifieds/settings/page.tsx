"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Setting = Record<string, any>
const types = [["town", "Towns"], ["classified_category", "Classified categories"], ["real_estate_type", "Real estate types"]]

export default function ClassifiedSettingsPage() {
  const [items, setItems] = useState<Setting[]>([])
  const [label, setLabel] = useState("")
  const [settingType, setSettingType] = useState("town")
  const [message, setMessage] = useState("")

  async function load() {
    const { data, error } = await supabase.from("classified_settings").select("*").order("setting_type").order("sort_order")
    if (error) setMessage(error.message)
    setItems(data || [])
  }
  useEffect(() => { load() }, [])

  async function add() {
    if (!label.trim()) return
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    const { error } = await supabase.from("classified_settings").insert({ setting_type: settingType, label, slug, sort_order: 100, is_active: true })
    if (error) setMessage(error.message)
    else { setLabel(""); await load() }
  }

  async function toggle(item: Setting) {
    const { error } = await supabase.from("classified_settings").update({ is_active: !item.is_active, updated_at: new Date().toISOString() }).eq("id", item.id)
    if (error) setMessage(error.message)
    else await load()
  }

  async function remove(item: Setting) {
    if (!window.confirm("Delete this setting?")) return
    const { error } = await supabase.from("classified_settings").delete().eq("id", item.id)
    if (error) setMessage(error.message)
    else await load()
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight">Classified Settings</h1>
        <p className="mt-3 text-slate-600">Edit towns, marketplace categories, and real estate types.</p>
        {message ? <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{message}</p> : null}
      </section>
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <select value={settingType} onChange={(e) => setSettingType(e.target.value)} className="rounded-2xl border px-4 py-3">{types.map(([v,t]) => <option key={v} value={v}>{t}</option>)}</select>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Name" className="rounded-2xl border px-4 py-3" />
          <button onClick={add} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Add</button>
        </div>
      </section>
      {types.map(([type, title]) => (
        <section key={type} className="space-y-3">
          <h2 className="text-2xl font-bold">{title}</h2>
          {items.filter((x) => x.setting_type === type).map((item) => (
            <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm">
              <div><h3 className="font-bold">{item.label}</h3><p className="text-sm text-slate-500">{item.slug} · {item.is_active ? "active" : "hidden"}</p></div>
              <div className="flex gap-2"><button onClick={() => toggle(item)} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wide">{item.is_active ? "Hide" : "Show"}</button><button onClick={() => remove(item)} className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">Delete</button></div>
            </article>
          ))}
        </section>
      ))}
    </main>
  )
}
