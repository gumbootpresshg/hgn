import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { articleExcerpt, articleAuthor, isEditorial } from "@/lib/article-routing"

export const revalidate = 60

export default async function EditorialsPage() {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .in("status", ["published", "approved", "public", "live", "active"])
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(300)

  const editorials = (data || []).filter(isEditorial)

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-slate-500">Opinion</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Editorials</h1>
        <p className="mt-3 text-slate-600">Editorials and opinion pieces from Haida Gwaii News.</p>
      </section>

      {error ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">{error.message}</p> : null}

      {editorials.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">No editorials found yet.</p>
      ) : (
        <section className="space-y-4">
          {editorials.map((article: any) => (
            <Link key={article.id} href={`/articles/${article.slug}`} className="block rounded-2xl border bg-white p-5 shadow-sm hover:border-hgnBlue">
              <p className="text-xs font-bold tracking-[0.18em] text-hgnBlue">Editorial</p>
              <h2 className="mt-2 text-2xl font-black">{article.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{articleExcerpt(article)}</p>
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
