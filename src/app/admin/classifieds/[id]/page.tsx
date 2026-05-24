"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Classified = Record<string, any>

export default function EditClassifiedPage() {
  const params = useParams<{ id: string }>()
  const [item, setItem] = useState<Classified | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  async function load() {
    const { data, error } = await supabase.from("classifieds").select("*").eq("id", params.id).single()
    if (error) setMessage(error.message)
    setItem(data)
  }

  useEffect(() => { load() }, [params.id])

  function patch(field: string, value: string | boolean) {
    setItem((current) => current ? { ...current, [field]: value } : current)
  }

  async function save(status?: string) {
    if (!item) return
    setSaving(true)
    const payload = {
      title: item.title || "Untitled classified",
      description: item.description || "",
      category: item.category || "marketplace",
      listing_type: item.listing_type || null,
      town: item.town || item.location || "Island-wide",
      location: item.location || item.town || null,
      price: item.price || null,
      contact_name: item.contact_name || null,
      contact_email: item.contact_email || null,
      phone: item.phone || null,
      image_url: item.image_url || null,
      bedrooms: item.bedrooms || null,
      bathrooms: item.bathrooms || null,
      square_feet: item.square_feet || null,
      lot_size: item.lot_size || null,
      property_type: item.property_type || null,
      property_address: item.property_address || null,
      employment_type: item.employment_type || null,
      rate_of_pay: item.rate_of_pay || null,
      make: item.make || null,
      model: item.model || null,
      year: item.year || null,
      mileage: item.mileage || null,
      transmission: item.transmission || null,
      colour: item.colour || null,
      map_url: item.map_url || null,
      admin_notes: item.admin_notes || null,
      is_featured: Boolean(item.is_featured),
      status: status || item.status || "pending",
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from("classifieds").update(payload).eq("id", item.id)
    if (error) setMessage(error.message)
    else setMessage("Saved.")
    setSaving(false)
  }

  if (!item) return <main className="px-6 py-10">Loading...</main>

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <Link href="/admin/classifieds" className="text-sm font-semibold text-slate-600">← Back to classifieds</Link>
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight">Edit Classified</h1>
        {message ? <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm">{message}</p> : null}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {["title","category","listing_type","town","location","price","contact_name","contact_email","phone","image_url","employment_type","rate_of_pay","property_type","bedrooms","bathrooms","square_feet","lot_size","property_address","make","model","year","mileage","transmission","colour","map_url"].map((field) => (
            <Field key={field} label={field.replaceAll("_", " ")} value={item[field] || ""} onChange={(v) => patch(field, v)} />
          ))}
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-semibold">Description</span>
          <textarea value={item.description || ""} onChange={(e) => patch("description", e.target.value)} rows={8} className="mt-2 w-full rounded-2xl border px-4 py-3" />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-semibold">Admin notes</span>
          <textarea value={item.admin_notes || ""} onChange={(e) => patch("admin_notes", e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border px-4 py-3" />
        </label>
        <label className="mt-4 flex items-center gap-2">
          <input type="checkbox" checked={Boolean(item.is_featured)} onChange={(e) => patch("is_featured", e.target.checked)} />
          <span className="text-sm font-semibold">Featured listing</span>
        </label>
        <div className="mt-6 flex flex-wrap gap-2">
          <button disabled={saving} onClick={() => save()} className="rounded-full bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Save</button>
          <button disabled={saving} onClick={() => save("approved")} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Approve</button>
          <button disabled={saving} onClick={() => save("pending")} className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 disabled:opacity-50">Pending</button>
          <button disabled={saving} onClick={() => save("rejected")} className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Reject</button>
        </div>
      </section>
    </main>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="text-sm font-semibold capitalize">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3" /></label>
}
