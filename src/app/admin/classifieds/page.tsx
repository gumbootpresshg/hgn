"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Classified = Record<string, any>

export default function AdminClassifiedsPage() {
  const [items, setItems] = useState<Classified[]>([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState("")
  const [message, setMessage] = useState("")

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from("classifieds").select("*").order("created_at", { ascending: false }).limit(200)
    if (error) setMessage(error.message)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function updateStatus(item: Classified, status: string) {
    setWorking(item.id)
    const { error } = await supabase.from("classifieds").update({ status, updated_at: new Date().toISOString() }).eq("id", item.id)
    if (error) setMessage(error.message)
    else await load()
    setWorking("")
  }

  async function deleteItem(item: Classified) {
    if (!window.confirm("Delete this classified?")) return
    setWorking(item.id)
    const { error } = await supabase.from("classifieds").delete().eq("id", item.id)
    if (error) setMessage(error.message)
    else await load()
    setWorking("")
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">HGN Admin</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Classifieds</h1>
        <p className="mt-3 text-slate-600">Approve, reject, edit, delete, and manage towns/categories for classifieds and real estate.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={load} className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white">Refresh</button>
          <Link href="/admin/classifieds/settings" className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700">Manage towns/categories</Link>
        </div>
        {message ? <p className="mt-4 rounded-2xl border bg-amber-50 p-4 text-sm text-amber-900">{message}</p> : null}
      </section>

      {loading ? <p className="rounded-2xl border bg-white p-6">Loading classifieds...</p> : items.length === 0 ? <p className="rounded-2xl border bg-white p-6">No classifieds found.</p> : (
        <section className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{item.title || "Untitled classified"}</h2>
                  <p className="mt-1 text-sm text-slate-500">{item.category || "marketplace"} · {item.listing_type || "standard"} · {item.town || item.location || "No town"} · {item.price || "No price"}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">{item.status || "pending"}</span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-700">{item.description || "No description."}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/admin/classifieds/${item.id}`} className="rounded-full bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">Edit</Link>
                <button disabled={working === item.id} onClick={() => updateStatus(item, "approved")} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Approve</button>
                <button disabled={working === item.id} onClick={() => updateStatus(item, "pending")} className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 disabled:opacity-50">Pending</button>
                <button disabled={working === item.id} onClick={() => updateStatus(item, "rejected")} className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Reject</button>
                <button disabled={working === item.id} onClick={() => deleteItem(item)} className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Delete</button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
