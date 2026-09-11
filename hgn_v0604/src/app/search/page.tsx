import Link from "next/link"
import { supabase } from "@/lib/supabase"

export const revalidate = 0

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const params = await searchParams
  const q = String(params?.q || "").trim()
  let articles: any[] = []

  if (q) {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .in("status", ["published", "approved", "public", "live", "active"])
      .or(`title.ilike.%${q}%,body.ilike.%${q}%,excerpt.ilike.%${q}%`)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(30)
    articles = data || []
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Search</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Search Haida Gwaii News</h1>
        <form action="/search" className="mt-6 flex gap-3">
          <input name="q" defaultValue={q} placeholder="Search articles..." className="min-w-0 flex-1 rounded-2xl border px-4 py-3" />
          <button className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">Search</button>
        </form>
      </section>

      {q ? (
        <section className="space-y-3">
          {articles.length === 0 ? <p className="rounded-2xl border bg-white p-6 text-slate-600">No results found.</p> : null}
          {articles.map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`} className="block rounded-2xl border bg-white p-5 hover:border-hgnBlue">
              <h2 className="text-xl font-black">{article.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{article.excerpt || String(article.body || "").replace(/<[^>]+>/g, " ").slice(0, 160)}</p>
            </Link>
          ))}
        </section>
      ) : null}
    </main>
  )
}
