"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"

type Classified = Record<string, any>
type Filter = "pending" | "approved" | "rejected" | "all"

const approvedStatuses = new Set(["approved", "active", "published", "public", "live"])
const rejectedStatuses = new Set(["rejected", "declined", "archived"])

function statusGroup(value: unknown): Exclude<Filter, "all"> {
  const status = String(value || "pending").toLowerCase()
  if (approvedStatuses.has(status)) return "approved"
  if (rejectedStatuses.has(status)) return "rejected"
  return "pending"
}

function statusLabel(value: unknown) {
  const status = String(value || "pending").toLowerCase()
  if (approvedStatuses.has(status)) return "Approved / live"
  if (rejectedStatuses.has(status)) return "Rejected"
  return "Pending review"
}

function statusClasses(value: unknown) {
  const group = statusGroup(value)
  if (group === "approved") return "bg-emerald-100 text-emerald-800"
  if (group === "rejected") return "bg-rose-100 text-rose-800"
  return "bg-amber-100 text-amber-900"
}

export default function AdminClassifiedsPage() {
  const [items, setItems] = useState<Classified[]>([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState("")
  const [filter, setFilter] = useState<Filter>("pending")
  const [message, setMessage] = useState("")
  const [messageTone, setMessageTone] = useState<"success" | "error">("success")

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from("classifieds").select("*").order("created_at", { ascending: false }).limit(200)
    if (error) {
      setMessageTone("error")
      setMessage(error.message)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const counts = useMemo(() => ({
    pending: items.filter((item) => statusGroup(item.status) === "pending").length,
    approved: items.filter((item) => statusGroup(item.status) === "approved").length,
    rejected: items.filter((item) => statusGroup(item.status) === "rejected").length,
    all: items.length,
  }), [items])

  const visibleItems = useMemo(() => filter === "all" ? items : items.filter((item) => statusGroup(item.status) === filter), [filter, items])

  async function updateStatus(item: Classified, status: "approved" | "pending" | "rejected") {
    setWorking(item.id)
    setMessage("")
    const { data, error } = await supabase
      .from("classifieds")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", item.id)
      .select("id,status")
      .single()

    if (error || !data) {
      setMessageTone("error")
      setMessage(error?.message || "The listing status could not be updated.")
    } else {
      setItems((current) => current.map((existing) => existing.id === item.id ? { ...existing, status: data.status } : existing))
      setMessageTone("success")
      setMessage(status === "approved" ? `Approved: “${item.title || "Untitled listing"}” is now live and has moved to Approved.` : status === "pending" ? `Returned “${item.title || "Untitled listing"}” to the pending queue.` : `Rejected “${item.title || "Untitled listing"}”.`)
    }
    setWorking("")
  }

  async function deleteItem(item: Classified) {
    if (!window.confirm(`Delete “${item.title || "this classified"}”? This cannot be undone.`)) return
    setWorking(item.id)
    setMessage("")
    const { error } = await supabase.from("classifieds").delete().eq("id", item.id)
    if (error) {
      setMessageTone("error")
      setMessage(error.message)
    } else {
      setItems((current) => current.filter((existing) => existing.id !== item.id))
      setMessageTone("success")
      setMessage("Listing deleted.")
    }
    setWorking("")
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">HGN Admin</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Marketplace review</h1>
        <p className="mt-3 text-slate-600">New listings arrive in Pending review. Approving a listing makes it live on Marketplace and moves it into the Approved tab.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => void load()} className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white">Refresh</button>
          <Link href="/admin/classifieds/settings" className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700">Manage towns/categories</Link>
        </div>
        {message ? <p className={`mt-4 rounded-2xl border p-4 text-sm font-semibold ${messageTone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900"}`}>{message}</p> : null}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatusTab label="Pending review" count={counts.pending} active={filter === "pending"} tone="amber" onClick={() => setFilter("pending")} />
        <StatusTab label="Approved / live" count={counts.approved} active={filter === "approved"} tone="green" onClick={() => setFilter("approved")} />
        <StatusTab label="Rejected" count={counts.rejected} active={filter === "rejected"} tone="rose" onClick={() => setFilter("rejected")} />
        <StatusTab label="All listings" count={counts.all} active={filter === "all"} tone="slate" onClick={() => setFilter("all")} />
      </section>

      {loading ? <p className="rounded-2xl border bg-white p-6">Loading listings...</p> : visibleItems.length === 0 ? (
        <section className="rounded-3xl border border-dashed bg-white p-8 text-center">
          <h2 className="text-xl font-bold">No {filter === "all" ? "listings" : `${filter} listings`}</h2>
          <p className="mt-2 text-sm text-slate-600">Choose another status above to review a different part of Marketplace.</p>
        </section>
      ) : (
        <section className="space-y-4">
          {visibleItems.map((item) => {
            const group = statusGroup(item.status)
            const isWorking = working === item.id
            return (
              <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold">{item.title || "Untitled classified"}</h2>
                    <p className="mt-1 text-sm text-slate-500">{item.category || "marketplace"} · {item.town || item.location || "No town"} · {item.price || "Contact for price"}</p>
                    <p className="mt-1 text-xs text-slate-400">Submitted {item.created_at ? new Date(item.created_at).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" }) : "date unknown"}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusClasses(item.status)}`}>{statusLabel(item.status)}</span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-700">{item.description || "No description."}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/admin/classifieds/${item.id}`} className="rounded-full bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">Open / edit</Link>
                  {group !== "approved" ? <button disabled={isWorking} onClick={() => void updateStatus(item, "approved")} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">{isWorking ? "Saving…" : "Approve & post"}</button> : null}
                  {group !== "pending" ? <button disabled={isWorking} onClick={() => void updateStatus(item, "pending")} className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 disabled:opacity-50">Return to pending</button> : null}
                  {group !== "rejected" ? <button disabled={isWorking} onClick={() => void updateStatus(item, "rejected")} className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Reject</button> : null}
                  <button disabled={isWorking} onClick={() => void deleteItem(item)} className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Delete</button>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}

function StatusTab({ label, count, active, tone, onClick }: { label: string; count: number; active: boolean; tone: "amber" | "green" | "rose" | "slate"; onClick: () => void }) {
  const tones = {
    amber: active ? "border-amber-500 bg-amber-50" : "border-transparent bg-white hover:border-amber-300",
    green: active ? "border-emerald-600 bg-emerald-50" : "border-transparent bg-white hover:border-emerald-300",
    rose: active ? "border-rose-500 bg-rose-50" : "border-transparent bg-white hover:border-rose-300",
    slate: active ? "border-slate-800 bg-slate-100" : "border-transparent bg-white hover:border-slate-300",
  }
  return <button onClick={onClick} className={`rounded-2xl border-2 p-5 text-left shadow-sm transition ${tones[tone]}`}><span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span><strong className="mt-2 block text-4xl font-black text-slate-950">{count}</strong></button>
}
