"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type LetterDraft = {
  id: string
  title: string | null
  sender_name: string | null
  sender_email: string | null
  sender_phone: string | null
  community: string | null
  message: string | null
  status: string | null
  admin_notes: string | null
  created_at: string | null
  edited_subject?: string
  edited_body?: string
}

export default function AdminLettersPage() {
  const [letters, setLetters] = useState<LetterDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState("")
  const [message, setMessage] = useState("")

  async function load() {
    setLoading(true)
    setMessage("")

    const { data, error } = await supabase
      .from("submission_inbox")
      .select("*")
      .eq("submission_type", "letter_to_editor")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      setMessage(error.message)
    }

    setLetters((data || []).map((item: any) => ({
      ...item,
      edited_subject: item.title || "Letter to the Editor",
      edited_body: item.message || "",
    })))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function updateLocal(id: string, patch: Partial<LetterDraft>) {
    setLetters((current) =>
      current.map((letter) => letter.id === id ? { ...letter, ...patch } : letter)
    )
  }

  async function saveInbox(letter: LetterDraft, status?: "pending" | "approved" | "rejected") {
    setWorkingId(letter.id)
    setMessage("")

    const nextStatus = status || letter.status || "pending"

    const { error } = await supabase
      .from("submission_inbox")
      .update({
        title: letter.edited_subject || letter.title,
        message: letter.edited_body || letter.message,
        community: letter.community,
        admin_notes: letter.admin_notes,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", letter.id)

    if (error) {
      setMessage(error.message)
    } else {
      await load()
    }

    setWorkingId("")
  }

  async function publish(letter: LetterDraft) {
    setWorkingId(letter.id)
    setMessage("")

    if (!letter.community || !letter.community.trim()) {
      setMessage("Community is required before publishing.")
      setWorkingId("")
      return
    }

    const publishedAt = new Date().toISOString()

    const publishPayload = {
      submission_id: letter.id,
      name: letter.sender_name,
      email: letter.sender_email,
      phone: letter.sender_phone,
      community: letter.community,
      location: letter.community,
      subject: letter.title,
      message: letter.edited_body || letter.message,
      body: letter.edited_body || letter.message,
      letter: letter.edited_body || letter.message || "",
      edited_subject: letter.edited_subject || letter.title || "Letter to the Editor",
      edited_body: letter.edited_body || letter.message || "",
      status: "approved",
      source: "editor",
      published_at: publishedAt,
      edited_at: publishedAt,
      editor_notes: letter.admin_notes,
      updated_at: publishedAt,
    }

    const existing = await supabase
      .from("letters_to_editor")
      .select("id")
      .eq("submission_id", letter.id)
      .maybeSingle()

    let letterError = existing.error

    if (!letterError && existing.data?.id) {
      const updateResult = await supabase
        .from("letters_to_editor")
        .update(publishPayload)
        .eq("id", existing.data.id)

      letterError = updateResult.error
    } else if (!letterError) {
      const insertResult = await supabase
        .from("letters_to_editor")
        .insert(publishPayload)

      letterError = insertResult.error
    }

    if (letterError) {
      setMessage(letterError.message)
      setWorkingId("")
      return
    }

    const { error: inboxError } = await supabase
      .from("submission_inbox")
      .update({
        title: letter.edited_subject || letter.title,
        message: letter.edited_body || letter.message,
        community: letter.community,
        status: "approved",
        admin_notes: letter.admin_notes,
        updated_at: publishedAt,
      })
      .eq("id", letter.id)

    if (inboxError) {
      setMessage(inboxError.message)
    } else {
      await load()
    }

    setWorkingId("")
  }

  async function deleteLetter(letter: LetterDraft) {
    const ok = window.confirm("Delete this letter submission and any published copy?")
    if (!ok) return

    setWorkingId(letter.id)
    setMessage("")

    await supabase.from("letters_to_editor").delete().eq("submission_id", letter.id)
    const { error } = await supabase.from("submission_inbox").delete().eq("id", letter.id)

    if (error) {
      setMessage(error.message)
    } else {
      await load()
    }

    setWorkingId("")
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          HGN Admin
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Letters Editor</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Public submissions land in the inbox first. Edit them here, then approve & publish to the public Letters page.
        </p>
        <button
          onClick={load}
          className="mt-6 rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white"
        >
          Refresh
        </button>
        {message ? (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {message}
          </p>
        ) : null}
      </section>

      {loading ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">Loading letters...</p>
      ) : letters.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">No letters submitted yet.</p>
      ) : (
        <section className="space-y-5">
          {letters.map((letter) => (
            <article key={letter.id} className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{letter.title || "Letter to the Editor"}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {letter.sender_name || "Unknown"} · {letter.sender_email || "No email"} · {letter.community || "No community"}
                  </p>
                </div>
                <span className={statusClass(letter.status || "pending")}>
                  {letter.status || "pending"}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold">Community required</span>
                  <input
                    value={letter.community || ""}
                    onChange={(event) => updateLocal(letter.id, { community: event.target.value })}
                    className="mt-2 w-full rounded-2xl border px-4 py-3"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">Edited headline/subject</span>
                  <input
                    value={letter.edited_subject || ""}
                    onChange={(event) => updateLocal(letter.id, { edited_subject: event.target.value })}
                    className="mt-2 w-full rounded-2xl border px-4 py-3"
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-semibold">Edited letter body</span>
                <textarea
                  value={letter.edited_body || ""}
                  onChange={(event) => updateLocal(letter.id, { edited_body: event.target.value })}
                  rows={10}
                  className="mt-2 w-full rounded-2xl border px-4 py-3"
                />
              </label>

              <label className="mt-4 block">
                <span className="text-sm font-semibold">Editor notes private</span>
                <textarea
                  value={letter.admin_notes || ""}
                  onChange={(event) => updateLocal(letter.id, { admin_notes: event.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border px-4 py-3"
                />
              </label>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  disabled={workingId === letter.id}
                  onClick={() => saveInbox(letter)}
                  className="rounded-full bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50"
                >
                  Save edits
                </button>
                <button
                  disabled={workingId === letter.id}
                  onClick={() => publish(letter)}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50"
                >
                  Approve & publish
                </button>
                <button
                  disabled={workingId === letter.id}
                  onClick={() => saveInbox(letter, "pending")}
                  className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 disabled:opacity-50"
                >
                  Pending
                </button>
                <button
                  disabled={workingId === letter.id}
                  onClick={() => saveInbox(letter, "rejected")}
                  className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  disabled={workingId === letter.id}
                  onClick={() => deleteLetter(letter)}
                  className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

function statusClass(status: string) {
  if (status === "approved") {
    return "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700"
  }

  if (status === "rejected") {
    return "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700"
  }

  return "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600"
}
