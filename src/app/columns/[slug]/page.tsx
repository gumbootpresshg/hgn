import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { articleExcerpt, articleAuthor, officialColumnNames, slugify } from "@/lib/article-routing"

export const revalidate = 60

function titleFromSlug(slug: string) {
  const official = officialColumnNames.find((name) => slugify(name) === slug)
  if (official) return official
  return slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")
}

function clean(value?: string | null) {
  return String(value || "").toLowerCase().trim()
}

export default async function ColumnDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const title = titleFromSlug(slug)

  const { data } = await supabase
    .from("articles")
    .select("*")
    .in("status", ["published", "approved", "public", "live", "active"])
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(300)

  const articles = (data || []).filter((article: any) => {
    const fields = [
      article.category,
      article.section,
      article.column_name,
      article.column,
      article.slug,
      article.title,
    ].map(clean)

    return fields.some((field) => field === clean(title) || slugify(field) === slug || field.includes(clean(title)))
  })

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-slate-500">Columns</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">{title}</h1>
        <Link href="/columns" className="mt-5 inline-flex text-sm font-bold text-hgnBlue">
          ← All columns
        </Link>
      </section>

      {articles.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">
          No published articles are connected to this column yet. Tag articles with “{title}” in category, section, column_name, or column.
        </p>
      ) : (
        <section className="space-y-4">
          {articles.map((article: any) => (
            <Link key={article.id} href={`/articles/${article.slug}`} className="block rounded-2xl border bg-white p-5 shadow-sm hover:border-hgnBlue">
              <p className="text-xs font-bold tracking-[0.18em] text-hgnBlue">
                {article.category || article.section || "Column"}
              </p>
              <h2 className="mt-2 text-2xl font-black">{article.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{articleExcerpt(article)}</p>
              <p className="mt-3 text-xs text-slate-500">
                {articleAuthor(article)}
                {article.published_at ? ` · ${new Date(article.published_at).toLocaleDateString("en-CA")}` : ""}
              </p>
            </Link>
          ))}
        </section>
      )}
    </main>
  )
}
