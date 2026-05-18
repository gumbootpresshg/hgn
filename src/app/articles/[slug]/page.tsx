import RelatedArticles from "@/components/RelatedArticles"
import ListenToArticle from "@/components/ListenToArticle"
import ArticleShare from "@/components/ArticleShare"
import { articleBackHref, articleBackLabel, displayAuthor } from "@/lib/article-routing"
import AdSlot from "@/components/AdSlot"
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import NewsArticleJsonLd from "@/components/NewsArticleJsonLd";
import { absoluteUrl, stripHtml, SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { data: article } = await supabase
    .from("articles")
    .select("title,seo_title,excerpt,meta_description,slug,image_url,og_image_url,published_at,updated_at,author_name")
    .eq("slug", slug)
    .single();

  if (!article) return { title: "Article | Haida Gwaii News" };

  const title = article.seo_title || article.title;
  const description = article.meta_description || stripHtml(article.excerpt || "").slice(0, 155);
  const image = article.og_image_url || article.image_url || SITE.defaultImage;
  const url = absoluteUrl(`/articles/${article.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at || article.published_at || undefined,
      authors: article.author_name ? [article.author_name] : undefined,
      images: [{ url: absoluteUrl(image) }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)],
    },
  };
}


function backHrefForArticle(article: any) {
  const combined = `${article?.title || ""} ${article?.slug || ""} ${article?.category || ""} ${article?.section || ""}`.toLowerCase()
  if (combined.includes("editorial")) return "/opinion/editorials"
  if (combined.includes("letter")) return "/letters"
  return "/news"
}

function backLabelForArticle(article: any) {
  const combined = `${article?.title || ""} ${article?.slug || ""} ${article?.category || ""} ${article?.section || ""}`.toLowerCase()
  if (combined.includes("editorial")) return "Back to Editorials"
  if (combined.includes("letter")) return "Back to Letters"
  return "{articleBackLabel(article)}"
}

function authorForArticle(article: any) {
  const combined = `${article?.title || ""} ${article?.slug || ""} ${article?.category || ""} ${article?.section || ""}`.toLowerCase()
  if (combined.includes("editorial")) return "Haida Gwaii News"
  return article?.author_name || article?.author || "Haida Gwaii News"
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !article) notFound();

  const image = article.image_url || article.og_image_url;

  return (
<main className="mx-auto max-w-5xl px-4 py-10">
      <NewsArticleJsonLd article={article} />

      <Link href="/articles" className="text-sm font-bold text-hgnBlue hover:underline">
        {`← ${articleBackLabel(article)}`}
      </Link>

      <article className="mt-6 rounded-2xl bg-white p-6 shadow-sm md:p-10">
        <div className="text-sm font-black uppercase tracking-wide text-hgnBlue">
          {article.category || "News"}
        </div>

        <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 md:text-5xl">
          {article.title}
        </h1>

        <div className="mt-4 border-b border-slate-200 pb-5 text-sm text-slate-600">
          {article.author_name && <span>By {article.author_name}</span>}
          {article.published_at && (
            <span>
              {" "}·{" "}
              {new Date(article.published_at).toLocaleDateString("en-CA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {image && (
          <figure className="mt-8">
            <img
              src={image}
              alt={article.image_alt || article.title}
              className="max-h-[560px] w-full rounded-xl object-cover"
            />
            {(article.image_caption || article.image_credit) && (
              <figcaption className="mt-2 text-sm text-slate-500">
                {article.image_caption}
                {article.image_credit ? ` Photo: ${article.image_credit}` : ""}
              </figcaption>
            )}
          </figure>
        )}

                  <ListenToArticle title={article.title} text={article.body || article.content || article.excerpt || ""} />
<div
          className="article-body mt-8 text-lg leading-8 text-slate-800"
          dangerouslySetInnerHTML={{ __html: article.body || "" }}
        />
</article>

      <section className="mx-auto my-10 max-w-5xl px-0">
        <AdSlot placement="article_bottom" fallbackHouseAd />
      </section>

          <section className="mt-8 space-y-4">
</section>

        
          <section className="mt-8 space-y-4">
            <ArticleShare title={article.title} />
          </section>
          <RelatedArticles article={article} />

        </main>
  );
}
