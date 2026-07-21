"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminPollsPage() {
  const [polls, setPolls] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data, error } = await supabase
      .from("polls")
      .select("*, poll_options(*)")
      .order("created_at", { ascending: false })

    if (error) setMessage(error.message)
    else setPolls(data || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function createPoll(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setSaving(true)
    setMessage("")

    try {
      const question = String(form.get("question") || "").trim()
      const options = String(form.get("options") || "").split("\n").map((item) => item.trim()).filter(Boolean)

      if (!question) return setMessage("Add a poll question.")
      if (options.length < 2) return setMessage("Add at least two poll options.")

      const { data: poll, error } = await supabase
        .from("polls")
        .insert({
          question,
          description: String(form.get("description") || "").trim(),
          status: String(form.get("status") || "draft"),
          show_on_home: form.get("show_on_home") === "on",
        })
        .select()
        .single()

      if (error) return setMessage(error.message)

      const { error: optionError } = await supabase.from("poll_options").insert(
        options.map((label, index) => ({ poll_id: poll.id, label, sort_order: index }))
      )

      if (optionError) return setMessage(optionError.message)

      setMessage("Poll created.")
      formElement.reset()
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function deletePoll(pollId: string) {
    if (!window.confirm("Delete this poll and its votes?")) return

    await supabase.from("poll_votes").delete().eq("poll_id", pollId)
    await supabase.from("poll_options").delete().eq("poll_id", pollId)
    const { error } = await supabase.from("polls").delete().eq("id", pollId)

    if (error) setMessage(error.message)
    else {
      setMessage("Poll deleted.")
      load()
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Polls</h1>
        <p className="mt-3 text-slate-600">Create, publish, show on home page, or delete reader polls.</p>
      </section>

      <form onSubmit={createPoll} className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
        <input name="question" required placeholder="Poll question" className="w-full rounded-2xl border px-4 py-3" />
        <textarea name="description" placeholder="Description, optional" className="w-full rounded-2xl border px-4 py-3" />
        <textarea name="options" required rows={5} placeholder={"One option per line"} className="w-full rounded-2xl border px-4 py-3" />
        <select name="status" className="rounded-2xl border px-4 py-3">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="active">Active</option>
        </select>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" name="show_on_home" />
          Show on home page
        </label>
        <button disabled={saving} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
          {saving ? "Creating..." : "Create Poll"}
        </button>
        {message ? <p className="rounded-2xl bg-slate-50 p-4 text-sm">{message}</p> : null}
      </form>

      <section className="grid gap-4 md:grid-cols-2">
        {polls.map((poll) => (
          <article key={poll.id} className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">{poll.status}</p>
                <h2 className="mt-2 text-xl font-black">{poll.question}</h2>
                <p className="mt-2 text-sm text-slate-600">{poll.show_on_home ? "Shown on home page" : "Not on home page"}</p>
              </div>
              <button onClick={() => deletePoll(poll.id)} className="rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
                Delete
              </button>
            </div>
            <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
              {(poll.poll_options || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).map((option: any) => (
                <li key={option.id}>{option.label}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  )
}
