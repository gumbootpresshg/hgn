import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { articleExcerpt, articleAuthor, isColumn, slugify, officialColumnNames } from "@/lib/article-routing"

function articleColumnSlug(article: any) {
  const fields = [article.column_name, article.column, article.category, article.section, article.slug, article.title].map((item) => String(item || ""))
  for (const field of fields) {
    const found = officialColumnNames.find((name) => slugify(name) === slugify(field) || field.toLowerCase().includes(name.toLowerCase()))
    if (found) return slugify(found)
  }
  return ""
}

export default async function RelatedArticles({ article }: { article: any }) {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .in("status", ["published", "approved", "public", "live", "active"])
    .neq("id", article.id)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(80)

  const all = data || []
  const currentColumn = articleColumnSlug(article)
  const sameColumn = currentColumn ? all.filter((item: any) => articleColumnSlug(item) === currentColumn).slice(0, 3) : []
  const otherColumns = all.filter((item: any) => isColumn(item) && articleColumnSlug(item) !== currentColumn).slice(0, 4)
  const moreArticles = all.filter((item: any) => !sameColumn.some((a: any) => a.id === item.id) && !otherColumns.some((a: any) => a.id === item.id)).slice(0, 4)

  return (
    <section className="mt-10 space-y-8 border-t pt-8">
      {sameColumn.length > 0 ? <RelatedBlock title="More from this column" articles={sameColumn} /> : null}
      {otherColumns.length > 0 ? <RelatedBlock title="From other columnists" articles={otherColumns} /> : null}
      {moreArticles.length > 0 ? <RelatedBlock title="More to read" articles={moreArticles} /> : null}
    </section>
  )
}

function RelatedBlock({ title, articles }: { title: string; articles: any[] }) {
  return (
    <section>
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {articles.map((item) => (
          <Link key={item.id} href={`/articles/${item.slug}`} className="rounded-2xl border bg-white p-5 shadow-sm hover:border-hgnBlue">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">{item.category || item.section || "Article"}</p>
            <h3 className="mt-2 text-xl font-black">{item.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{articleExcerpt(item)}</p>
            <p className="mt-3 text-xs text-slate-500">{articleAuthor(item)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
