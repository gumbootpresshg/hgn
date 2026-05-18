import ArticleListCard from "@/components/ArticleListCard"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { articleExcerpt, articleAuthor, isLocalNews, isMountieMinute, isSports } from "@/lib/article-routing"

type Props = {
  title: string
  description: string
  sectionType: "local-news" | "sports" | "mountie-minute"
  emptyText?: string
}

export default async function SectionArticleList({
  title,
  description,
  sectionType,
  emptyText,
}: Props) {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .in("status", ["published", "approved", "public", "live", "active"])
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(300)

  let articles = data || []

  if (sectionType === "local-news") articles = articles.filter(isLocalNews)
  if (sectionType === "sports") articles = articles.filter(isSports)
  if (sectionType === "mountie-minute") articles = articles.filter(isMountieMinute)

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-slate-500">Haida Gwaii News</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">{title}</h1>
        <p className="mt-3 text-slate-600">{description}</p>
      </section>

      {error ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">{error.message}</p>
      ) : null}

      {articles.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">{emptyText || "No published articles found yet."}</p>
      ) : (
        <section className="space-y-4">
          {articles.map((article: any) => (<ArticleListCard key={article.id} article={article} fallbackLabel={title} />))}
        </section>
      )}
    </main>
  )
}
