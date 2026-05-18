"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { uploadAdImage } from "@/lib/ad-upload"

type Ad = Record<string, any>
type Placement = Record<string, any>

export default function EditAdPage() {
  const params = useParams<{ id: string }>()
  const [ad, setAd] = useState<Ad | null>(null)
  const [placements, setPlacements] = useState<Placement[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")

  async function load() {
    const [adRes, placementsRes] = await Promise.all([
      supabase.from("ads").select("*").eq("id", params.id).single(),
      supabase.from("ad_placements").select("*").order("label"),
    ])

    if (adRes.error) setMessage(adRes.error.message)
    setAd(adRes.data)
    setPlacements(placementsRes.data || [])
  }

  useEffect(() => {
    load()
  }, [params.id])

  function patch(field: string, value: string | number | boolean | null) {
    setAd((current) => (current ? { ...current, [field]: value } : current))
  }

  async function handleUpload(file: File | null) {
    if (!ad || !file) return
    setUploading(true)
    setMessage("")

    try {
      const uploaded = await uploadAdImage(file, ad.id)
      patch("image_url", uploaded.publicUrl)
      patch("uploaded_path", uploaded.path)
      patch("file_size_bytes", uploaded.size)

      if (!ad.alt_text) {
        patch("alt_text", ad.title || "Advertisement")
      }

      setMessage("Ad image uploaded. Click Save to keep it on the ad.")
    } catch (error: any) {
      setMessage(error?.message || "Upload failed.")
    } finally {
      setUploading(false)
    }
  }

  const selectedPlacement = ad
    ? placements.find((placement) => placement.placement_key === ad.placement_key)
    : null

  async function save(status?: string) {
    if (!ad) return

    setSaving(true)
    setMessage("")

    const { error } = await supabase
      .from("ads")
      .update({
        title: ad.title || "Untitled ad",
        advertiser_name: ad.advertiser_name || null,
        placement_key: ad.placement_key || "site_top",
        image_url: ad.image_url || null,
        destination_url: ad.destination_url || null,
        alt_text: ad.alt_text || null,
        html_code: ad.html_code || null,
        uploaded_path: ad.uploaded_path || null,
        file_size_bytes: ad.file_size_bytes || null,
        rotation_weight: Number(ad.rotation_weight || 1),
        start_date: ad.start_date || null,
        end_date: ad.end_date || null,
        status: status || ad.status || "draft",
        sort_order: Number(ad.sort_order || 0),
        notes: ad.notes || null,
        is_house_ad: Boolean(ad.is_house_ad),
        updated_at: new Date().toISOString(),
      })
      .eq("id", ad.id)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("Saved.")
    }

    setSaving(false)
  }

  if (!ad) {
    return <main className="px-6 py-10">Loading...</main>
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <Link href="/admin/ads" className="text-sm font-semibold text-slate-600">
        ← Back to Ad Manager
      </Link>

      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight">Edit Ad</h1>

        {message ? (
          <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm">{message}</p>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Title" value={ad.title || ""} onChange={(v) => patch("title", v)} />
          <Field label="Advertiser" value={ad.advertiser_name || ""} onChange={(v) => patch("advertiser_name", v)} />

          <label className="block">
            <span className="text-sm font-semibold">Placement</span>
            <select
              value={ad.placement_key || ""}
              onChange={(event) => patch("placement_key", event.target.value)}
              className="mt-2 w-full rounded-2xl border px-4 py-3"
            >
              {placements.map((placement) => (
                <option key={placement.placement_key} value={placement.placement_key}>
                  {placement.label} ({placement.placement_key})
                </option>
              ))}
            </select>
          </label>

          <Field label="Sort order" type="number" value={String(ad.sort_order || 0)} onChange={(v) => patch("sort_order", Number(v))} />
          <Field label="Rotation weight" type="number" value={String(ad.rotation_weight || 1)} onChange={(v) => patch("rotation_weight", Number(v))} />
          <Field label="Image URL" value={ad.image_url || ""} onChange={(v) => patch("image_url", v)} />
          <Field label="Destination URL" value={ad.destination_url || ""} onChange={(v) => patch("destination_url", v)} />
          <Field label="Alt text" value={ad.alt_text || ""} onChange={(v) => patch("alt_text", v)} />
          <Field label="Start date" type="date" value={ad.start_date || ""} onChange={(v) => patch("start_date", v)} />
          <Field label="End date" type="date" value={ad.end_date || ""} onChange={(v) => patch("end_date", v)} />
        </div>

        {selectedPlacement ? (
          <section className="mt-6 rounded-2xl border bg-slate-50 p-5">
            <h2 className="text-lg font-bold">Recommended upload size</h2>
            <p className="mt-2 text-sm text-slate-600">
              Desktop: {selectedPlacement.recommended_width || 970} × {selectedPlacement.recommended_height || 250}px.
              Mobile: {selectedPlacement.mobile_width || 640} × {selectedPlacement.mobile_height || 180}px.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {selectedPlacement.size_notes || "Upload WebP, JPG, PNG, or GIF. Keep under 2MB if possible."}
            </p>
          </section>
        ) : null}

        <section className="mt-6 rounded-2xl border bg-white p-5">
          <h2 className="text-lg font-bold">Upload ad image</h2>
          <p className="mt-1 text-sm text-slate-600">
            Upload the banner/artwork here instead of pasting an image URL.
          </p>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(event) => handleUpload(event.target.files?.[0] || null)}
            className="mt-4 block w-full text-sm"
          />
        </section>

        <label className="mt-4 block">
          <span className="text-sm font-semibold">HTML code optional</span>
          <textarea
            value={ad.html_code || ""}
            onChange={(event) => patch("html_code", event.target.value)}
            rows={5}
            className="mt-2 w-full rounded-2xl border px-4 py-3"
          />
        </label>

        <label className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(ad.is_house_ad)}
            onChange={(event) => patch("is_house_ad", event.target.checked)}
          />
          <span className="text-sm font-semibold">House ad / HGN self-promotion</span>
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold">Notes</span>
          <textarea
            value={ad.notes || ""}
            onChange={(event) => patch("notes", event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-2xl border px-4 py-3"
          />
        </label>

        {ad.image_url ? (
          <div className="mt-6 overflow-hidden rounded-2xl border bg-slate-50 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ad.image_url}
              alt={ad.alt_text || ad.title || "Ad preview"}
              className="mx-auto max-h-80 object-contain"
            />
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <button disabled={saving} onClick={() => save()} className="rounded-full bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">
            Save
          </button>
          <button disabled={saving} onClick={() => save("active")} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">
            Activate
          </button>
          <button disabled={saving} onClick={() => save("paused")} className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 disabled:opacity-50">
            Pause
          </button>
          <button disabled={saving} onClick={() => save("draft")} className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">
            Draft
          </button>
        </div>
      </section>
    </main>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  type?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border px-4 py-3"
      />
    </label>
  )
}