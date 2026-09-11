"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Placement = Record<string, any>

export default function AdPlacementsPage() {
  const [items, setItems] = useState<Placement[]>([])
  const [message, setMessage] = useState("")

  async function load() {
    const { data, error } = await supabase.from("ad_placements").select("*").order("page_area").order("label")
    if (error) setMessage(error.message)
    setItems(data || [])
  }

  useEffect(() => { load() }, [])

  async function toggle(item: Placement) {
    const { error } = await supabase.from("ad_placements").update({ is_active: !item.is_active, updated_at: new Date().toISOString() }).eq("id", item.id)
    if (error) setMessage(error.message)
    else await load()
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight">Ad Placements</h1>
        <p className="mt-3 text-slate-600">Turn ad placements on/off and see placement keys used by the site.</p>
        {message ? <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{message}</p> : null}
      </section>

      <section className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">{item.label || item.title || item.placement || 'Ad Placement'}</h2>
                <p className="text-sm text-slate-500">{item.placement_key || item.placement} · {item.business_name || 'HGN House Ad'} · {item.page_area || 'site'} · max {item.max_ads || 1}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Desktop {item.recommended_width || 970} × {item.recommended_height || 250}px · Mobile {item.mobile_width || 640} × {item.mobile_height || 180}px · Rotation {item.rotation_enabled === false ? "off" : "on"}
                </p>
                <p className="mt-2 text-sm text-slate-600">{item.description || 'No description.'}</p>
              </div>
              <button onClick={() => toggle(item)} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wide">
                {item.is_active ? "Disable" : "Enable"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
