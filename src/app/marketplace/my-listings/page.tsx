"use client"

import { formatPrice } from "@/lib/marketplace-options"

import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function MyListingsPage() {
  const [user, setUser] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  async function load() {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    setUser(userData.user)

    if (userData.user) {
      const { data, error } = await supabase
        .from("classifieds")
        .select("*")
        .eq("user_id", userData.user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })

      if (error) setMessage(error.message)
      setItems(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function updateStatus(id: string, status: string) {
    const patch: any = { status, updated_at: new Date().toISOString() }
    if (status === "sold") patch.sold_at = new Date().toISOString()

    const { error } = await supabase.from("classifieds").update(patch).eq("id", id)
    if (error) setMessage(error.message)
    else load()
  }

  async function removeListing(id: string) {
    const { error } = await supabase
      .from("classifieds")
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) setMessage(error.message)
    else load()
  }

  if (loading) return <main className="mx-auto max-w-5xl px-6 py-10">Loading…</main>

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-6 py-10">
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-black tracking-tight">Log in required</h1>
          <p className="mt-3 text-slate-600">Log in to manage your Marketplace listings.</p>
          <Link href="/login" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Log in</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Marketplace</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">My Listings</h1>
            <p className="mt-3 text-slate-600">{user.email}</p>
          </div>
          <Link href="/submit-classified" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Post Listing</Link>
        </div>
        {message ? <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{message}</p> : null}
      </section>

      {items.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">You have not posted any listings yet.</p>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="rounded-3xl border bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">{item.status || "pending"}</p>
              <h2 className="mt-2 text-xl font-black">{item.title || "Untitled listing"}</h2>
              <p className="mt-1 text-sm font-bold">{formatPrice(item.price_amount || item.price)}</p>
              <p className="mt-1 text-xs text-slate-500">{item.town || item.location || "Haida Gwaii"}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/marketplace/${item.id}`} className="rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide">View</Link>
                <button onClick={() => updateStatus(item.id, "sold")} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wide">Mark Sold</button>
                <button onClick={() => removeListing(item.id)} className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">Remove</button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
