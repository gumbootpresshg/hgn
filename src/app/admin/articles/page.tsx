"use client"

import ColumnSelector from "@/components/admin/ColumnSelector"
import { columnSlugFor } from "@/lib/column-options"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [message, setMessage] = useState("")

  async function load() {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) setMessage(error.message)
    else setArticles(data || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleFeatured(article: any) {
    const currentlyFeatured = Boolean(article.is_featured || article.featured)

    const { error } = await supabase
      .from("articles")
      .update({
        is_featured: !currentlyFeatured,
        featured: !currentlyFeatured,
        featured_at: !currentlyFeatured ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id)

    if (error) setMessage(error.message)
    else {
      setMessage(!currentlyFeatured ? "Article featured." : "Article unfeatured.")
      await load()
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Articles</h1>
        <p className="mt-3 text-slate-600">Manage stories and choose which articles are featured on the front page.</p>
      </section>

      {message ? <p className="rounded-2xl bg-slate-50 p-4 text-sm">{message}</p> : null}

      <section className="grid gap-4">
        {articles.map((article) => {
          const featured = Boolean(article.is_featured || article.featured)

          return (
            <article key={article.id} className="rounded-3xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">
                    {featured ? "Featured" : article.status || "Article"}
                  </p>
                  <h2 className="mt-2 text-xl font-black">{article.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{[article.category, article.section, article.author_name || article.author].filter(Boolean).join(" · ")}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/articles/${article.id}`} className="rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide">
                    Edit
                  </Link>
                  {article.slug ? (
                    <Link href={`/articles/${article.slug}`} className="rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide">
                      View
                    </Link>
                  ) : null}

                  <button
                    onClick={() => toggleFeatured(article)}
                    className={featured ? "rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-wide text-white" : "rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-wide text-white"}
                  >
                    {featured ? "Unfeature" : "Feature"}
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}
