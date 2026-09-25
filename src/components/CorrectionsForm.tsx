"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function CorrectionsForm() {
  const [form, setForm] = useState({ name: "", email: "", story_url: "", details: "" })
  const [message, setMessage] = useState("")

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setMessage("Sending…")
    const { error } = await supabase.from("correction_requests").insert({ ...form, status: "new" })
    setMessage(error ? error.message : "Thanks — the editor will review it.")
  }

  return <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
    <h2 className="font-serif text-2xl font-bold text-hgnNavy">Submit a correction</h2>
    <input className="hgn-input" placeholder="Name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} />
    <input className="hgn-input" placeholder="Email" type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} />
    <input className="hgn-input" placeholder="Story URL or headline" value={form.story_url} onChange={event => setForm({ ...form, story_url: event.target.value })} />
    <textarea className="hgn-input min-h-40" placeholder="What should we review?" value={form.details} onChange={event => setForm({ ...form, details: event.target.value })} />
    <button className="hgn-btn-primary">Submit correction</button>
    {message ? <p className="font-semibold text-hgnNavy" role="status">{message}</p> : null}
  </form>
}
