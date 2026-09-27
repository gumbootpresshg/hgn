"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { guideCategories } from "@/lib/guide-places"
import { supabase } from "@/lib/supabase"

type Place = {
  id: string; slug: string; name: string; category: string; community: string; latitude: number | null; longitude: number | null
  description: string | null; address: string | null; phone: string | null; website: string | null; hours: string | null
  amenities: string[] | null; caution: string | null; featured: boolean; published: boolean; image_url: string | null
  source_name: string | null; source_url: string | null; verified_at: string | null; next_review_at: string | null
}

const empty = (): Omit<Place, "id"> => ({ slug: "", name: "", category: "Food", community: "", latitude: null, longitude: null, description: "", address: "", phone: "", website: "", hours: "", amenities: [], caution: "", featured: false, published: false, image_url: "", source_name: "", source_url: "", verified_at: null, next_review_at: null })
const field = (value: string | null | undefined) => value || ""

export default function GuideManagerPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [selected, setSelected] = useState<Place | Omit<Place, "id">>(empty())
  const [query, setQuery] = useState("")
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data, error } = await supabase.from("hgn_guide_places").select("*").order("featured", { ascending: false }).order("name")
    setPlaces((data || []) as Place[])
    if (error) setMessage(error.message)
  }
  useEffect(() => { void load() }, [])
  const visible = useMemo(() => places.filter((place) => `${place.name} ${place.category} ${place.community}`.toLowerCase().includes(query.toLowerCase())), [places, query])

  function choose(place: Place) { setSelected({ ...place, amenities: place.amenities || [] }); setMessage("") }
  function update(key: string, value: unknown) { setSelected((current) => ({ ...current, [key]: value })) }
  function makeSlug(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("")
    const current = selected as Place
    const payload = {
      slug: current.slug || makeSlug(current.name), name: current.name.trim(), category: current.category, community: current.community.trim(),
      latitude: current.latitude === null || current.latitude === undefined ? null : Number(current.latitude), longitude: current.longitude === null || current.longitude === undefined ? null : Number(current.longitude),
      description: field(current.description), address: field(current.address) || null, phone: field(current.phone) || null, website: field(current.website) || null, hours: field(current.hours) || null,
      amenities: (current.amenities || []).map((item) => item.trim()).filter(Boolean), caution: field(current.caution) || null, featured: Boolean(current.featured), published: Boolean(current.published), image_url: field(current.image_url) || null,
      source_name: field(current.source_name) || null, source_url: field(current.source_url) || null, verified_at: current.verified_at || null, next_review_at: current.next_review_at || null, updated_at: new Date().toISOString(),
    }
    if (!payload.name || !payload.slug || !payload.category || !payload.community) { setSaving(false); setMessage("Name, slug, category and community are required."); return }
    const result = "id" in current ? await supabase.from("hgn_guide_places").update(payload).eq("id", current.id).select("*").single() : await supabase.from("hgn_guide_places").insert(payload).select("*").single()
    setSaving(false)
    if (result.error) { setMessage(result.error.message); return }
    setMessage("Guide place saved. It is public only when Published is enabled.")
    if (result.data) setSelected(result.data as Place)
    await load()
  }

  async function remove() {
    if (!("id" in selected) || !confirm(`Archive ${selected.name}? It will be kept in the database but removed from the public Guide.`)) return
    const { error } = await supabase.from("hgn_guide_places").update({ published: false, featured: false, updated_at: new Date().toISOString() }).eq("id", selected.id)
    setMessage(error?.message || "Place archived from the public Guide.")
    if (!error) { setSelected(empty()); await load() }
  }

  return <main className="mx-auto max-w-[1500px] space-y-6 px-4 py-7 md:px-7">
    <header className="rounded-3xl border bg-white p-6 shadow-sm md:p-8"><p className="text-xs font-black uppercase tracking-[.2em] text-hgnBlue">Haida Gwaii Guide</p><h1 className="mt-2 font-serif text-5xl font-bold">Guide Manager</h1><p className="mt-3 max-w-3xl text-slate-600">Create and maintain the places readers see on the public map, directory and featured Guide. Save drafts freely; only published places appear publicly.</p><div className="mt-5 flex flex-wrap gap-3"><button onClick={() => { setSelected(empty()); setMessage("") }} className="hgn-btn-primary">Add guide place</button><Link href="/admin/guide-keeper" className="rounded-full border px-5 py-3 text-sm font-black">Review source checks</Link><Link href="/explore/map" className="rounded-full border px-5 py-3 text-sm font-black">Open public map</Link></div></header>
    {message ? <p className="rounded-2xl border bg-white p-4 font-semibold">{message}</p> : null}
    <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <aside className="rounded-3xl border bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><h2 className="font-serif text-3xl font-bold">Places</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">{places.length}</span></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search places" className="mt-4 w-full rounded-2xl border px-4 py-3" /><div className="mt-4 max-h-[65vh] space-y-2 overflow-auto pr-1">{visible.map((place) => <button key={place.id} onClick={() => choose(place)} className={`w-full rounded-2xl border p-4 text-left ${"id" in selected && selected.id === place.id ? "border-hgnBlue bg-hgnBlue/5" : "hover:border-hgnBlue"}`}><div className="flex items-start justify-between gap-2"><strong>{place.name}</strong><span className={`rounded-full px-2 py-1 text-[10px] font-black ${place.published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{place.published ? "PUBLIC" : "DRAFT"}</span></div><p className="mt-1 text-xs text-slate-500">{place.category} · {place.community}</p>{!place.verified_at ? <p className="mt-2 text-xs font-bold text-amber-700">Needs verification</p> : null}</button>)}{!visible.length ? <p className="p-4 text-sm text-slate-500">No matching places.</p> : null}</div></aside>
      <form onSubmit={save} className="rounded-3xl border bg-white p-5 shadow-sm md:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-hgnBlue">{"id" in selected ? "Edit place" : "New place"}</p><h2 className="mt-1 font-serif text-4xl font-bold">{"id" in selected ? selected.name || "Untitled place" : "New guide place"}</h2></div><label className="flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-black"><input type="checkbox" checked={Boolean(selected.published)} onChange={(event) => update("published", event.target.checked)} /> Public</label></div>
        <div className="mt-7 grid gap-4 md:grid-cols-2"><Label label="Place name *"><input required value={selected.name} onChange={(event) => { update("name", event.target.value); if (!("id" in selected)) update("slug", makeSlug(event.target.value)) }} className="input" /></Label><Label label="Public slug *"><input required value={selected.slug} onChange={(event) => update("slug", makeSlug(event.target.value))} className="input" /></Label><Label label="Category *"><select value={selected.category} onChange={(event) => update("category", event.target.value)} className="input">{guideCategories.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}</select></Label><Label label="Community *"><input required value={selected.community} onChange={(event) => update("community", event.target.value)} placeholder="e.g. Masset" className="input" /></Label><Label label="Latitude"><input type="number" step="any" value={selected.latitude ?? ""} onChange={(event) => update("latitude", event.target.value === "" ? null : Number(event.target.value))} className="input" /></Label><Label label="Longitude"><input type="number" step="any" value={selected.longitude ?? ""} onChange={(event) => update("longitude", event.target.value === "" ? null : Number(event.target.value))} className="input" /></Label></div>
        <Label label="Reader description *" className="mt-4"><textarea required rows={4} value={field(selected.description)} onChange={(event) => update("description", event.target.value)} className="input" /></Label>
        <div className="mt-4 grid gap-4 md:grid-cols-2"><Label label="Address / area"><input value={field(selected.address)} onChange={(event) => update("address", event.target.value)} className="input" /></Label><Label label="Phone"><input value={field(selected.phone)} onChange={(event) => update("phone", event.target.value)} className="input" /></Label><Label label="Official website"><input type="url" value={field(selected.website)} onChange={(event) => update("website", event.target.value)} className="input" /></Label><Label label="Current hours / notes"><input value={field(selected.hours)} onChange={(event) => update("hours", event.target.value)} className="input" /></Label><Label label="Photo URL"><input type="url" value={field(selected.image_url)} onChange={(event) => update("image_url", event.target.value)} placeholder="Optional public image URL" className="input" /></Label><Label label="Amenities (comma separated)"><input value={(selected.amenities || []).join(", ")} onChange={(event) => update("amenities", event.target.value.split(","))} className="input" /></Label></div>
        <Label label="Caution / seasonal note" className="mt-4"><textarea rows={2} value={field(selected.caution)} onChange={(event) => update("caution", event.target.value)} className="input" /></Label>
        <section className="mt-7 rounded-2xl bg-slate-50 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-serif text-2xl font-bold">Verification</h3><label className="flex min-h-11 items-center gap-2 text-sm font-black"><input type="checkbox" checked={Boolean(selected.featured)} onChange={(event) => update("featured", event.target.checked)} /> Feature on Guide home</label></div><div className="mt-4 grid gap-4 md:grid-cols-2"><Label label="Source name"><input value={field(selected.source_name)} onChange={(event) => update("source_name", event.target.value)} placeholder="Official source or business" className="input" /></Label><Label label="Source URL"><input type="url" value={field(selected.source_url)} onChange={(event) => update("source_url", event.target.value)} className="input" /></Label><Label label="Last verified"><input type="date" value={selected.verified_at ? selected.verified_at.slice(0, 10) : ""} onChange={(event) => update("verified_at", event.target.value ? `${event.target.value}T12:00:00.000Z` : null)} className="input" /></Label><Label label="Review again on"><input type="date" value={selected.next_review_at || ""} onChange={(event) => update("next_review_at", event.target.value || null)} className="input" /></Label></div></section>
        <div className="mt-7 flex flex-wrap gap-3"><button disabled={saving} className="hgn-btn-primary">{saving ? "Saving…" : "Save guide place"}</button>{"id" in selected ? <button type="button" onClick={() => void remove()} className="rounded-full border border-red-200 px-5 py-3 text-sm font-black text-red-800">Archive from public Guide</button> : null}</div>
      </form>
    </section>
  </main>
}

function Label({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) { return <label className={`block ${className}`}><span className="mb-2 block text-sm font-black text-slate-700">{label}</span>{children}</label> }
