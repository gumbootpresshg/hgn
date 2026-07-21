import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { cleanImportedHtml } from "@/lib/clean-html"

export const revalidate = 0

type Letter = {
  id: string
  name: string | null
  community: string | null
  location: string | null
  subject: string | null
  message: string | null
  body: string | null
  letter: string | null
  edited_subject: string | null
  edited_body: string | null
  status: string | null
  published_at: string | null
  created_at: string | null
  source?: string | null
}

type ArticleLetter = {
  id: string
  title: string | null
  author: string | null
  category: string | null
  body: string | null
  content: string | null
  excerpt: string | null
  dek: string | null
  status: string | null
  published_at: string | null
  created_at: string | null
}

export default async function LettersPage() {
  const lettersRes = await supabase
    .from("letters_to_editor")
    .select("id,name,community,location,subject,message,body,letter,edited_subject,edited_body,status,published_at,created_at,source")
    .in("status", ["approved", "published", "public", "active", "live"])
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100)

  const articleLettersRes = await supabase
    .from("articles")
    .select("id,title,author,category,body,content,excerpt,dek,status,published_at,created_at,slug")
    .in("status", ["published", "approved", "public", "active", "live"])
    .or("category.ilike.%letter%,category.ilike.%opinion%,title.ilike.%letter to the editor%,title.ilike.%letter:%")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100)

  const directLetters = ((lettersRes.data || []) as Letter[]).map((item) => ({
    id: `letter-${item.id}`,
    title: item.edited_subject || item.subject || "Letter to the Editor",
    author: item.name || "Name withheld",
    community: item.community || item.location || "Community",
    body: cleanImportedHtml(item.edited_body || item.body || item.letter || item.message || "Letter text unavailable."),
    date: item.published_at || item.created_at,
  }))

  const articleLetters = ((articleLettersRes.data || []) as ArticleLetter[])
    .filter((item) => !directLetters.some((letter) => letter.title === (item.title || "Letter to the Editor")))
    .map((item) => ({
      id: `article-${item.id}`,
      title: item.title || "Letter to the Editor",
      author: item.author || "Name withheld",
      community: "Community",
      body: cleanImportedHtml(item.body || item.content || item.excerpt || item.dek || "Letter text unavailable."),
      date: item.published_at || item.created_at,
    }))

  const letters = [...directLetters, ...articleLetters].sort((a, b) => {
    return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  })

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          Opinion
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Letters to the Editor</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Community letters published after editor review.
        </p>
        <Link
          href="/submit-letter"
          className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white"
        >
          Submit a letter
        </Link>
      </section>

      {lettersRes.error ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          Could not load letters table: {lettersRes.error.message}
        </p>
      ) : null}

      {letters.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">
          No letters have been published yet.
        </p>
      ) : (
        <section className="space-y-5">
          {letters.map((item) => (
            <article key={item.id} className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">{item.title}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {item.community}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                By {item.author}{item.date ? ` · ${formatDate(item.date)}` : ""}
              </p>
              <div className="mt-5 whitespace-pre-wrap text-base leading-8 text-slate-700">
                {item.body}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}


function formatDate(value?: string | null) {
  if (!value) return ""
  try {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(value))
  } catch {
    return ""
  }
}
