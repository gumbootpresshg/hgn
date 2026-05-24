import Link from "next/link"
import { articleAuthor, articleExcerpt } from "@/lib/article-routing"

export default function ArticleListCard({ article, fallbackLabel = "Article" }: { article: any; fallbackLabel?: string }) {
  const image =
    article.image_url ||
    article.featured_image_url ||
    article.hero_image_url ||
    article.thumbnail_url ||
    article.photo_url ||
    article.main_image_url ||
    article.image

  return (
    <Link key={article.id} href={`/articles/${article.slug}`} className="block rounded-2xl border bg-white p-5 shadow-sm hover:border-hgnBlue">
      <div className="flex gap-4">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={article.title || "Article image"} className="h-24 w-32 shrink-0 rounded-2xl object-cover" />
        ) : null}
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.18em] text-hgnBlue">{article.subcategory || article.category || article.section || fallbackLabel}</p>
          <h2 className="mt-2 text-2xl font-black">{article.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{articleExcerpt(article)}</p>
          <p className="mt-3 text-xs text-slate-500">
            {articleAuthor(article)}
            {article.published_at ? ` · ${new Date(article.published_at).toLocaleDateString("en-CA")}` : ""}
          </p>
        </div>
      </div>
    </Link>
  )
}
