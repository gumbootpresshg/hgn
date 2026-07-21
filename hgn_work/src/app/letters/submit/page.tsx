"use client"

import Link from "next/link"
import { useState } from "react"

export default function LettersSubmitPage() {
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage("")

    const form = new FormData(event.currentTarget)
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      town: String(form.get("town") || ""),
      letter: String(form.get("letter") || ""),
      website: String(form.get("website") || ""),
    }

    try {
      const response = await fetch("/api/submit-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Unable to submit letter.")
      setMessage("Thanks. Your letter has been submitted for editor review.")
      event.currentTarget.reset()
    } catch (error: any) {
      setMessage(error?.message || "Unable to submit letter.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <Link href="/letters" className="text-sm font-semibold text-slate-600">← Back to Letters</Link>
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Opinion</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Submit a Letter to the Editor</h1>
        <p className="mt-3 text-slate-600">
          Send your letter for editor review. HGN may edit for length, clarity, legal concerns, and community standards.
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold">Name
              <input name="name" required className="mt-2 w-full rounded-2xl border px-4 py-3" />
            </label>
            <label className="text-sm font-bold">Email
              <input name="email" type="email" required className="mt-2 w-full rounded-2xl border px-4 py-3" />
            </label>
          </div>
          <label className="text-sm font-bold">Community / town
            <input name="town" placeholder="Masset, Skidegate, Tlell..." className="mt-2 w-full rounded-2xl border px-4 py-3" />
          </label>
          <label className="text-sm font-bold">Letter
            <textarea name="letter" required rows={12} className="mt-2 w-full rounded-2xl border px-4 py-3" placeholder="Paste or type your letter here." />
          </label>
          <button disabled={saving} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
            {saving ? "Submitting..." : "Submit Letter"}
          </button>
          {message ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{message}</p> : null}
        </form>
      </section>
    </main>
  )
}
