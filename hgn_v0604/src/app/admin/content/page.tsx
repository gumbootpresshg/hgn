"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"

type Letter = Record<string, any>

export default function AdminContentLibraryPage() {
  const [letters, setLetters] = useState<Letter[]>([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState("")
  const [message, setMessage] = useState("")

  async function load() {
    setLoading(true)
    setMessage("")

    const { data, error } = await supabase
      .from("letters_to_editor")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) setMessage(error.message || "Could not load letters.")
    setLetters(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function updateStatus(id: string, status: string) {
    setWorking(id)
    setMessage("")

    const patch: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === "approved" || status === "published") {
      patch.published_at = new Date().toISOString()
    }

    const { error } = await supabase.from("letters_to_editor").update(patch).eq("id", id)

    if (error) setMessage(error.message)
    else await load()

    setWorking("")
  }

  async function deleteLetter(id: string) {
    const ok = window.confirm("Delete this letter? This cannot be undone.")
    if (!ok) return

    setWorking(id)
    setMessage("")

    const { error } = await supabase.from("letters_to_editor").delete().eq("id", id)

    if (error) setMessage(error.message)
    else await load()

    setWorking("")
  }

  const counts = useMemo(() => ({
    letters: letters.length,
    pending: letters.filter((x) => ["pending", "submitted", "new"].includes(String(x.status || "").toLowerCase())).length,
    drafts: letters.filter((x) => String(x.status || "").toLowerCase() === "draft").length,
    live: letters.filter((x) => isLiveLetter(x.status)).length,
  }), [letters])

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          HGN Admin
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Content / Submissions Hub</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          This page is now for letters and submission moderation. Articles are managed in one place only:
          the main Article Manager.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Stat label="Letters" value={counts.letters} />
          <Stat label="Pending" value={counts.pending} />
          <Stat label="Drafts" value={counts.drafts} />
          <Stat label="Live" value={counts.live} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={load} className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white">
            Refresh
          </button>
          <Link href="/admin/articles" className="rounded-full bg-hgnBlue px-5 py-2 text-sm font-semibold text-white">
            Article Manager
          </Link>
          <Link href="/admin/articles/new" className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700">
            Add Article
          </Link>
          <Link href="/admin/letters" className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700">
            Letters editor
          </Link>
          <Link href="/admin/submissions" className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700">
            Reader submissions
          </Link>
        </div>

        {message ? (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {message}
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Article editing moved</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          To avoid two different article editors, article editing, publishing, featuring, SEO, categories,
          columns, and deletion now belong in <strong>/admin/articles</strong>. This page remains a moderation hub for letters and other submissions.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/admin/articles" className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white">
            Open Article Manager
          </Link>
          <Link href="/admin/content/articles" className="rounded-full border px-5 py-2 text-sm font-semibold text-slate-700">
            Old article tools, if needed
          </Link>
        </div>
      </section>

      {loading ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">Loading letters...</p>
      ) : (
        <LetterSection
          letters={letters}
          working={working}
          onStatus={updateStatus}
          onDelete={deleteLetter}
        />
      )}
    </main>
  )
}

function LetterSection({
  letters,
  working,
  onStatus,
  onDelete,
}: {
  letters: Letter[]
  working: string
  onStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">Letters / published letter archive</h2>
      {letters.length === 0 ? (
        <p className="rounded-2xl border bg-white p-5 text-sm text-slate-500">
          No rows found in the `letters_to_editor` table. New unapproved letters are in `/admin/letters`.
        </p>
      ) : (
        letters.map((letter) => (
          <article key={letter.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">{letter.edited_subject || letter.subject || "Letter to the Editor"}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {letter.name || "Name withheld"} · {letter.community || letter.location || "No community"} · {formatDate(letter.published_at || letter.created_at)}
                </p>
              </div>
              <StatusBadge status={letter.status || "draft"} />
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-slate-600">
              {letter.edited_body || letter.body || letter.letter || letter.message || "No preview text."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/admin/content/letters/${letter.id}`}
                className="rounded-full bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
              >
                Edit letter
              </Link>
              <button disabled={working === letter.id} onClick={() => onStatus(letter.id, "approved")} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">
                Publish
              </button>
              <button disabled={working === letter.id} onClick={() => onStatus(letter.id, "draft")} className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 disabled:opacity-50">
                Draft
              </button>
              <button disabled={working === letter.id} onClick={() => onStatus(letter.id, "archived")} className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">
                Archive
              </button>
              <button disabled={working === letter.id} onClick={() => onDelete(letter.id)} className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">
                Delete
              </button>
            </div>
          </article>
        ))
      )}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return <span className={statusClass(status)}>{status}</span>
}

function statusClass(status: string) {
  const value = String(status || "").toLowerCase()
  if (value === "published" || value === "approved" || value === "live" || value === "active") {
    return "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700"
  }
  if (value === "draft" || value === "pending" || value === "submitted" || value === "new") {
    return "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600"
  }
  return "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700"
}

function isLiveLetter(status: string | null | undefined) {
  return ["approved", "published", "public", "live", "active"].includes(String(status || "").toLowerCase())
}

function formatDate(value?: string | null) {
  if (!value) return "No date"
  try {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value))
  } catch {
    return "No date"
  }
}
