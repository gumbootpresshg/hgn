"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Ad = Record<string, any>
type Placement = Record<string, any>

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [placements, setPlacements] = useState<Placement[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [working, setWorking] = useState("")

  async function load() {
    setLoading(true)
    setMessage("")

    const [adsRes, placementsRes] = await Promise.all([
      supabase.from("ads").select("*").order("placement_key").order("sort_order"),
      supabase.from("ad_placements").select("*").order("page_area").order("label"),
    ])

    if (adsRes.error || placementsRes.error) {
      setMessage(adsRes.error?.message || placementsRes.error?.message || "Could not load ads.")
    }

    setAds(adsRes.data || [])
    setPlacements(placementsRes.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createAd() {
    const placement = placements[0]?.placement_key || "site_top"
    const { data, error } = await supabase
      .from("ads")
      .insert({
        title: "New ad",
        advertiser_name: "Advertiser",
        placement_key: placement,
        status: "draft",
      })
      .select("id")
      .single()

    if (error) setMessage(error.message)
    else window.location.href = `/admin/ads/${data.id}`
  }

  async function updateStatus(ad: Ad, status: string) {
    setWorking(ad.id)
    const { error } = await supabase
      .from("ads")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", ad.id)

    if (error) setMessage(error.message)
    else await load()

    setWorking("")
  }

  async function deleteAd(ad: Ad) {
    if (!window.confirm("Delete this ad?")) return
    setWorking(ad.id)

    const { error } = await supabase.from("ads").delete().eq("id", ad.id)

    if (error) setMessage(error.message)
    else await load()

    setWorking("")
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">HGN Admin</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Ad Manager</h1>
        <p className="mt-3 text-slate-600">Create, edit, place, activate, pause, and delete ads/banners.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={createAd} className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white">Create ad</button>
          <Link href="/admin/ads/placements" className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700">Placements</Link>
          <button onClick={load} className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700">Refresh</button>
        </div>
        {message ? <p className="mt-4 rounded-2xl border bg-amber-50 p-4 text-sm text-amber-900">{message}</p> : null}
      </section>

      {loading ? <p className="rounded-2xl border bg-white p-6">Loading ads...</p> : ads.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6">No ads yet.</p>
      ) : (
        <section className="space-y-4">
          {ads.map((ad) => (
            <article key={ad.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{ad.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {ad.advertiser_name || "No advertiser"} · {ad.placement_key} · {ad.status}{ad.is_house_ad ? " · house ad" : ""}
                  </p>
                </div>
                {ad.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ad.image_url} alt={ad.alt_text || ad.title} className="h-16 w-32 rounded-xl object-cover" />
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/admin/ads/${ad.id}`} className="rounded-full bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">Edit</Link>
                <button disabled={working === ad.id} onClick={() => updateStatus(ad, "active")} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Activate</button>
                <button disabled={working === ad.id} onClick={() => updateStatus(ad, "paused")} className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 disabled:opacity-50">Pause</button>
                <button disabled={working === ad.id} onClick={() => updateStatus(ad, "draft")} className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Draft</button>
                <button disabled={working === ad.id} onClick={() => deleteAd(ad)} className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Delete</button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
