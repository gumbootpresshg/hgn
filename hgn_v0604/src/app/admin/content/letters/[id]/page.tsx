"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { cleanImportedHtml } from "@/lib/clean-html"

type Letter = Record<string, any>

export default function EditPublishedLetterPage() {
  const params = useParams<{ id: string }>()
  const [letter, setLetter] = useState<Letter | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from("letters_to_editor").select("*").eq("id", params.id).single()
    if (error) setMessage(error.message)
    setLetter(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [params.id])

  function patch(field: string, value: any) {
    setLetter((current) => current ? { ...current, [field]: value } : current)
  }

  async function save(status?: string) {
    if (!letter) return
    setSaving(true)
    setMessage("")

    const nextStatus = status || letter.status || "draft"
    const body = letter.edited_body || letter.body || letter.letter || letter.message || ""

    const payload = {
      name: letter.name || null,
      email: letter.email || null,
      community: letter.community || letter.location || "Community not provided",
      location: letter.community || letter.location || "Community not provided",
      subject: letter.subject || letter.edited_subject || "Letter to the Editor",
      edited_subject: letter.edited_subject || letter.subject || "Letter to the Editor",
      message: body,
      body,
      letter: body || "Letter text unavailable.",
      edited_body: body || "Letter text unavailable.",
      status: nextStatus,
      published_at: isLive(nextStatus) ? (letter.published_at || new Date().toISOString()) : letter.published_at,
      edited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      editor_notes: letter.editor_notes || null,
    }

    const { error } = await supabase.from("letters_to_editor").update(payload).eq("id", letter.id)
    if (error) setMessage(error.message)
    else setMessage("Saved.")
    setSaving(false)
  }

  if (loading) return <main className="px-6 py-10">Loading...</main>
  if (!letter) return <main className="px-6 py-10">Letter not found.</main>

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <Link href="/admin/content" className="text-sm font-semibold text-slate-600">← Back to content library</Link>
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight">Edit Published Letter</h1>
        {message ? <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm">{message}</p> : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Writer name" value={letter.name || ""} onChange={(value) => patch("name", value)} />
          <Field label="Email private" value={letter.email || ""} onChange={(value) => patch("email", value)} />
          <Field label="Community" value={letter.community || letter.location || ""} onChange={(value) => patch("community", value)} />
          <Field label="Subject/headline" value={letter.edited_subject || letter.subject || ""} onChange={(value) => patch("edited_subject", value)} />
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-semibold">Letter body</span>
          <textarea value={cleanImportedHtml(letter.edited_body || letter.body || letter.letter || letter.message || "")} onChange={(event) => patch("edited_body", event.target.value)} rows={14} className="mt-2 w-full rounded-2xl border px-4 py-3" />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold">Editor notes private</span>
          <textarea value={letter.editor_notes || ""} onChange={(event) => patch("editor_notes", event.target.value)} rows={3} className="mt-2 w-full rounded-2xl border px-4 py-3" />
        </label>

        <div className="mt-6 flex flex-wrap gap-2">
          <button disabled={saving} onClick={() => save()} className="rounded-full bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Save</button>
          <button disabled={saving} onClick={() => save("approved")} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Publish</button>
          <button disabled={saving} onClick={() => save("draft")} className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 disabled:opacity-50">Draft</button>
          <button disabled={saving} onClick={() => save("archived")} className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">Archive</button>
        </div>
      </section>
    </main>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3" />
    </label>
  )
}

function isLive(status: string) {
  return ["approved", "published", "public", "live", "active"].includes(String(status || "").toLowerCase())
}
