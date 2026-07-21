"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminNewsletterPage() {
  const [message, setMessage] = useState("")

  async function createDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    const { error } = await supabase.from("newsletter_drafts").insert({
      title: String(form.get("title") || ""),
      subject: String(form.get("subject") || ""),
      intro: String(form.get("intro") || ""),
      date_from: String(form.get("date_from") || "") || null,
      date_to: String(form.get("date_to") || "") || null,
      status: "draft",
    })

    setMessage(error ? error.message : "Newsletter draft created.")
    if (!error) event.currentTarget.reset()
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Newsletter Builder</h1>
        <p className="mt-3 text-slate-600">
          Create newsletter drafts by date range. Article picker/send integration can be added next.
        </p>
      </section>

      <form onSubmit={createDraft} className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
        <input name="title" required placeholder="Newsletter title" className="w-full rounded-2xl border px-4 py-3" />
        <input name="subject" placeholder="Email subject" className="w-full rounded-2xl border px-4 py-3" />
        <textarea name="intro" rows={5} placeholder="Intro note from the publisher" className="w-full rounded-2xl border px-4 py-3" />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-bold">From date<input name="date_from" type="date" className="mt-2 w-full rounded-2xl border px-4 py-3" /></label>
          <label className="text-sm font-bold">To date<input name="date_to" type="date" className="mt-2 w-full rounded-2xl border px-4 py-3" /></label>
        </div>
        <button className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">Create Draft</button>
        {message ? <p className="rounded-2xl bg-slate-50 p-4 text-sm">{message}</p> : null}
      </form>
    </main>
  )
}
