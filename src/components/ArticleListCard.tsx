import Link from "next/link"
import Image from "next/image"
import { articleAuthor, articleExcerpt } from "@/lib/article-routing"
import { getArticleImage } from "@/lib/article-images"

export default function ArticleListCard({ article, fallbackLabel = "Article" }: { article: any; fallbackLabel?: string }) {
  const image = getArticleImage(article)
  return (
    <Link href={`/articles/${article.slug}`} className="group block border-b border-stone-300 py-5 first:pt-0">
      <div className="grid gap-4 sm:grid-cols-[1fr_180px] sm:items-start">
        <div className="min-w-0">
          <p className="newspaper-kicker">{article.subcategory || article.category || article.section || fallbackLabel}</p>
          <h2 className="mt-1 font-serif text-2xl font-bold leading-tight text-stone-950 group-hover:text-hgnRed md:text-3xl">{article.title}</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">{articleExcerpt(article)}</p>
          <span className="mt-3 inline-block text-[11px] font-bold uppercase tracking-[0.12em]">Read more →</span>
          <p className="mt-3 text-xs text-stone-500">{articleAuthor(article)}{article.published_at ? ` · ${new Date(article.published_at).toLocaleDateString("en-CA")}` : ""}</p>
        </div>
        {image ? <div className="relative aspect-[4/3] overflow-hidden bg-stone-200"><Image src={image} alt={article.title || "Article image"} fill sizes="180px" className="object-cover transition duration-300 group-hover:scale-[1.02]" /></div> : null}
      </div>
    </Link>
  )
}
