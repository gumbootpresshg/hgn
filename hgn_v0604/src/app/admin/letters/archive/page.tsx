"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { cleanImportedHtml } from "@/lib/clean-html"

type Row = Record<string, any>

export default function AdminLettersArchivePage() {
  const [letters, setLetters] = useState<Row[]>([])
  const [articleMatches, setArticleMatches] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  async function load() {
    setLoading(true)
    setMessage("")

    const [lettersRes, articlesRes] = await Promise.all([
      supabase
        .from("letters_to_editor")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("articles")
        .select("*")
        .in("status", ["published", "approved", "public", "active", "live"])
        .or("category.ilike.%letter%,category.ilike.%opinion%,title.ilike.%letter to the editor%,title.ilike.%letter:%")
        .order("created_at", { ascending: false })
        .limit(200),
    ])

    if (lettersRes.error || articlesRes.error) {
      setMessage(lettersRes.error?.message || articlesRes.error?.message || "Could not load archive.")
    }

    setLetters(lettersRes.data || [])
    setArticleMatches(articlesRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function importArticle(article: Row) {
    setMessage("")
    const body = cleanImportedHtml(article.body || article.content || article.excerpt || article.dek || "Letter text unavailable.")

    const { error } = await supabase.from("letters_to_editor").insert({
      source_article_id: article.id,
      name: article.author || "Name withheld",
      email: "archive-import@haidagwaiinews.local",
      community: "Community not provided",
      location: "Community not provided",
      subject: article.title || "Letter to the Editor",
      message: body,
      body,
      letter: body,
      edited_subject: article.title || "Letter to the Editor",
      edited_body: body,
      status: "approved",
      source: "manual_article_import",
      published_at: article.published_at || article.created_at || new Date().toISOString(),
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("Imported article as letter.")
      await load()
    }
  }

  const counts = useMemo(() => ({
    letters: letters.length,
    articleMatches: articleMatches.length,
    publicLetters: letters.filter((x) => ["approved", "published", "public", "active", "live"].includes(String(x.status || "").toLowerCase())).length,
  }), [letters, articleMatches])

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          HGN Admin
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Letters Archive</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Use this page to find older letters that may be stored as articles/opinion rows and import them into the Letters page.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Letters table rows" value={counts.letters} />
          <Stat label="Public letters" value={counts.publicLetters} />
          <Stat label="Article matches" value={counts.articleMatches} />
        </div>

        <button onClick={load} className="mt-6 rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white">
          Refresh
        </button>

        {message ? (
          <p className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">{message}</p>
        ) : null}
      </section>

      {loading ? (
        <p className="rounded-2xl border bg-white p-6">Loading...</p>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-2xl font-bold">Likely old letters stored as articles</h2>
            {articleMatches.length === 0 ? (
              <p className="rounded-2xl border bg-white p-5 text-sm text-slate-500">
                No matching article rows found by category/title.
              </p>
            ) : (
              articleMatches.map((article) => (
                <article key={article.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h3 className="font-bold">{article.title || "Untitled"}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {article.category || "No category"} · {article.author || "No author"} · {article.status || "No status"} · {formatDate(article.published_at || article.created_at)}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                    {article.body || article.content || article.excerpt || article.dek || "No preview."}
                  </p>
                  <button
                    onClick={() => importArticle(article)}
                    className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
                  >
                    Import as published letter
                  </button>
                </article>
              ))
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">Rows already in letters table</h2>
            {letters.length === 0 ? (
              <p className="rounded-2xl border bg-white p-5 text-sm text-slate-500">
                No rows in letters_to_editor.
              </p>
            ) : (
              letters.map((letter) => (
                <article key={letter.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h3 className="font-bold">{letter.edited_subject || letter.subject || "Letter to the Editor"}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {letter.name || "Name withheld"} · {letter.community || letter.location || "No community"} · {letter.status || "No status"} · {formatDate(letter.published_at || letter.created_at)}
                  </p>
                </article>
              ))
            )}
          </section>
        </>
      )}
    </main>
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
