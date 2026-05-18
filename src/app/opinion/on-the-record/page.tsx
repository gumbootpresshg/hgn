import Link from "next/link"
import { supabase } from "@/lib/supabase"

export const revalidate = 0

export default async function OnTheRecordPage() {
  const { data, error } = await supabase
    .from("articles")
    .select("id,title,slug,excerpt,dek,author,category,published_at,created_at,status")
    .in("status", ["published", "approved", "public", "live", "active"])
    .or("category.eq.On the Record,title.ilike.%on the record%,slug.ilike.%on-the-record%")
    .not("category", "ilike", "%editorial%")
    .not("title", "ilike", "%editorial%")
    .not("slug", "ilike", "%editorial%")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(50)

  const articles = (data || []).filter((article) => {
    const title = String(article.title || "").toLowerCase()
    const slug = String(article.slug || "").toLowerCase()
    const category = String(article.category || "").toLowerCase()

    const isOnTheRecord =
      category === "on the record" ||
      title.includes("on the record") ||
      slug.includes("on-the-record")

    const isEditorial =
      category.includes("editorial") ||
      title.includes("editorial") ||
      slug.includes("editorial")

    return isOnTheRecord && !isEditorial
  })

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Opinion</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">On the Record</h1>
        <p className="mt-3 text-slate-600">Only On the Record articles appear here. Editorials belong under Editorials.</p>
      </section>

      {error ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">{error.message}</p>
      ) : null}

      {articles.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">No On the Record articles found.</p>
      ) : (
        <section className="space-y-4">
          {articles.map((article) => (
            <article key={article.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <Link href={`/articles/${article.slug}`} className="text-2xl font-bold hover:underline">
                {article.title}
              </Link>
              <p className="mt-2 text-sm text-slate-500">
                {article.author || "HGN"} · {formatDate(article.published_at || article.created_at)}
              </p>
              <p className="mt-3 text-slate-600">{article.excerpt || article.dek}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

function formatDate(value?: string | null) {
  if (!value) return "No date"
  try {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(value))
  } catch {
    return "No date"
  }
}
