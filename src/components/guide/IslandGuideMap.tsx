"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { GuidePlace } from "@/lib/guide-places"

export default function IslandGuideMap({ places, initialCategory = "All" }: { places: GuidePlace[]; initialCategory?: string }) {
  const mapEl = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const layerRef = useRef<any>(null)
  const [category, setCategory] = useState(initialCategory)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<GuidePlace | null>(null)

  const categories = useMemo(() => ["All", ...Array.from(new Set(places.map((p) => p.category)))], [places])
  const filtered = useMemo(() => places.filter((place) => {
    if (category !== "All" && place.category !== category) return false
    const haystack = `${place.name} ${place.community} ${place.category} ${place.description} ${(place.amenities || []).join(" ")}`.toLowerCase()
    return !query.trim() || haystack.includes(query.toLowerCase().trim())
  }), [places, category, query])

  useEffect(() => {
    let cancelled = false
    async function loadMap() {
      if (!mapEl.current || mapRef.current) return
      const L = await import("leaflet")
      if (cancelled || !mapEl.current) return
      const map = L.map(mapEl.current, { scrollWheelZoom: false }).setView([53.62, -132.02], 8)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 18 }).addTo(map)
      mapRef.current = map
      layerRef.current = L.layerGroup().addTo(map)
    }
    loadMap()
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null }
  }, [])

  useEffect(() => {
    async function draw() {
      if (!mapRef.current || !layerRef.current) return
      const L = await import("leaflet")
      layerRef.current.clearLayers()
      filtered.forEach((place) => {
        const marker = L.circleMarker([place.latitude, place.longitude], { radius: place.featured ? 9 : 7, weight: 2, color: "#111827", fillColor: "#ffffff", fillOpacity: 1 })
        marker.bindTooltip(place.name)
        marker.on("click", () => setSelected(place))
        marker.addTo(layerRef.current)
      })
      if (filtered.length) {
        const bounds = L.latLngBounds(filtered.map((p) => [p.latitude, p.longitude] as [number, number]))
        mapRef.current.fitBounds(bounds.pad(0.16), { maxZoom: 11 })
      }
    }
    draw()
  }, [filtered])

  return <div className="grid gap-5 lg:grid-cols-[1.45fr_0.75fr]">
    <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="grid gap-3 border-b p-4 md:grid-cols-[1fr_auto]">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search beaches, fuel, communities..." className="rounded-xl border px-4 py-3" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border px-4 py-3">
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div ref={mapEl} className="h-[520px] w-full" aria-label="Interactive Haida Gwaii guide map" />
    </div>

    <aside className="space-y-4">
      {selected ? <article className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-hgnBlue">{selected.category} · {selected.community}</p>
        <h2 className="mt-2 text-2xl font-black">{selected.name}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{selected.description}</p>
        {selected.caution ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">{selected.caution}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">{(selected.amenities || []).map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{item}</span>)}</div>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`} target="_blank" rel="noreferrer" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white">Directions</a>
          {selected.website ? <a href={selected.website} target="_blank" rel="noreferrer" className="rounded-full border px-4 py-2 text-sm font-bold">Official link</a> : null}
        </div>
      </article> : <div className="rounded-3xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-black">Choose a map marker</h2><p className="mt-2 text-sm leading-6 text-slate-600">Details, cautions, amenities and directions will appear here.</p></div>}

      <div className="max-h-[360px] space-y-2 overflow-auto rounded-3xl border bg-white p-3 shadow-sm">
        {filtered.map((place) => <button key={place.id} onClick={() => { setSelected(place); mapRef.current?.setView([place.latitude, place.longitude], 12) }} className="w-full rounded-2xl p-3 text-left hover:bg-slate-50">
          <span className="text-xs font-black uppercase tracking-wide text-hgnBlue">{place.category}</span>
          <span className="mt-1 block font-black">{place.name}</span>
          <span className="text-xs text-slate-500">{place.community}</span>
        </button>)}
      </div>
    </aside>
  </div>
}
