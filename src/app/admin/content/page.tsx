"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"

type Article = Record<string, any>
type Letter = Record<string, any>

export default function AdminContentLibraryPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [letters, setLetters] = useState<Letter[]>([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState("")
  const [message, setMessage] = useState("")

  async function load() {
    setLoading(true)
    setMessage("")

    const [articleRes, letterRes] = await Promise.all([
      supabase.from("articles").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("letters_to_editor").select("*").order("created_at", { ascending: false }).limit(200),
    ])

    if (articleRes.error || letterRes.error) {
      setMessage(articleRes.error?.message || letterRes.error?.message || "Could not load content.")
    }

    setArticles(articleRes.data || [])
    setLetters(letterRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function updateStatus(table: "articles" | "letters_to_editor", id: string, status: string) {
    setWorking(`${table}:${id}`)
    setMessage("")

    const patch: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === "published" || status === "approved") {
      patch.published_at = new Date().toISOString()
    }

    const { error } = await supabase.from(table).update(patch).eq("id", id)

    if (error) {
      setMessage(error.message)
    } else {
      await load()
    }

    setWorking("")
  }

  async function deleteRow(table: "articles" | "letters_to_editor", id: string) {
    const ok = window.confirm("Delete this item? This cannot be undone.")
    if (!ok) return

    setWorking(`${table}:${id}`)
    setMessage("")

    const { error } = await supabase.from(table).delete().eq("id", id)

    if (error) {
      setMessage(error.message)
    } else {
      await load()
    }

    setWorking("")
  }

  const counts = useMemo(() => ({
    articles: articles.length,
    letters: letters.length,
    drafts:
      articles.filter((x) => String(x.status || "").toLowerCase() === "draft").length +
      letters.filter((x) => String(x.status || "").toLowerCase() === "draft").length,
    live:
      articles.filter((x) => isLiveArticle(x.status)).length +
      letters.filter((x) => isLiveLetter(x.status)).length,
  }), [articles, letters])

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          HGN Admin
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Content Library</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          This is where past articles and published letters should live for editor work:
          edit, draft, publish, reject, or delete.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Stat label="Articles" value={counts.articles} />
          <Stat label="Letters" value={counts.letters} />
          <Stat label="Drafts" value={counts.drafts} />
          <Stat label="Live" value={counts.live} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={load} className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white">
            Refresh
          </button>
          <Link href="/admin/letters" className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700">
            Letters editor
          </Link>
          <Link href="/admin/submissions" className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700">
            Submissions
          </Link>
        </div>

        {message ? (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {message}
          </p>
        ) : null}
      </section>

      {loading ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">Loading content...</p>
      ) : (
        <>
          <ArticleSection
            articles={articles}
            working={working}
            onStatus={updateStatus}
            onDelete={deleteRow}
          />
          <LetterSection
            letters={letters}
            working={working}
            onStatus={updateStatus}
            onDelete={deleteRow}
          />
        </>
      )}
    </main>
  )
}

function ArticleSection({
  articles,
  working,
  onStatus,
  onDelete,
}: {
  articles: Article[]
  working: string
  onStatus: (table: "articles", id: string, status: string) => void
  onDelete: (table: "articles", id: string) => void
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">Articles</h2>
      {articles.length === 0 ? (
        <p className="rounded-2xl border bg-white p-5 text-sm text-slate-500">
          No article rows found in the `articles` table.
        </p>
      ) : (
        articles.map((article) => (
          <article key={article.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">{article.title || "Untitled article"}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {article.category || "No category"} · {article.author || "No author"} · {article.slug || "No slug"}
                </p>
              </div>
              <StatusBadge status={article.status || "draft"} />
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-slate-600">
              {article.excerpt || article.dek || article.body || article.content || "No preview text."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/admin/content/articles/${article.id}`}
                className="rounded-full bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
              >
                Edit
              </Link>
              <button disabled={working === `articles:${article.id}`} onClick={() => onStatus("articles", article.id, "published")} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">
                Publish
              </button>
              <button disabled={working === `articles:${article.id}`} onClick={() => onStatus("articles", article.id, "draft")} className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 disabled:opacity-50">
                Draft
              </button>
              <button disabled={working === `articles:${article.id}`} onClick={() => onStatus("articles", article.id, "archived")} className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">
                Archive
              </button>
              <button disabled={working === `articles:${article.id}`} onClick={() => onDelete("articles", article.id)} className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">
                Delete
              </button>
            </div>
          </article>
        ))
      )}
    </section>
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
  onStatus: (table: "letters_to_editor", id: string, status: string) => void
  onDelete: (table: "letters_to_editor", id: string) => void
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">Published / archived letters</h2>
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
                Edit
              </Link>
              <button disabled={working === `letters_to_editor:${letter.id}`} onClick={() => onStatus("letters_to_editor", letter.id, "approved")} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">
                Publish
              </button>
              <button disabled={working === `letters_to_editor:${letter.id}`} onClick={() => onStatus("letters_to_editor", letter.id, "draft")} className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 disabled:opacity-50">
                Draft
              </button>
              <button disabled={working === `letters_to_editor:${letter.id}`} onClick={() => onStatus("letters_to_editor", letter.id, "archived")} className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">
                Archive
              </button>
              <button disabled={working === `letters_to_editor:${letter.id}`} onClick={() => onDelete("letters_to_editor", letter.id)} className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50">
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
  if (value === "draft" || value === "pending") {
    return "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600"
  }
  return "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700"
}

function isLiveArticle(status: string | null | undefined) {
  return ["published", "approved", "public", "live", "active"].includes(String(status || "").toLowerCase())
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
