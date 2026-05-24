import RelatedArticles from "@/components/RelatedArticles";
import ListenToArticle from "@/components/ListenToArticle";
import ArticleShare from "@/components/ArticleShare";
import { articleBackLabel, displayAuthor } from "@/lib/article-routing";
import AdSlot from "@/components/AdSlot";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import NewsArticleJsonLd from "@/components/NewsArticleJsonLd";
import { absoluteUrl, stripHtml, SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

type Article = {
  id?: string;
  title?: string;
  seo_title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  body?: string | null;
  content?: string | null;
  meta_description?: string | null;
  author?: string | null;
  author_name?: string | null;
  category?: string | null;
  subcategory?: string | null;
  column_name?: string | null;
  image_url?: string | null;
  cover_image_url?: string | null;
  og_image_url?: string | null;
  image_alt?: string | null;
  image_caption?: string | null;
  image_credit?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
};

function articleDescription(article: Article) {
  return (
    article.meta_description ||
    stripHtml(article.excerpt || "").slice(0, 155) ||
    stripHtml(article.body || article.content || "").slice(0, 155) ||
    SITE.description
  );
}

function displayDate(value?: string | null) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { data: article } = await supabase
    .from("articles")
    .select("title,seo_title,excerpt,body,meta_description,slug,image_url,cover_image_url,og_image_url,published_at,updated_at,author_name,author,category,subcategory")
    .eq("slug", slug)
    .maybeSingle();

  if (!article) return { title: `Article | ${SITE.name}` };

  const typed = article as Article;
  const title = typed.seo_title || typed.title || SITE.name;
  const description = articleDescription(typed);
  const image = typed.og_image_url || typed.cover_image_url || typed.image_url || SITE.defaultImage;
  const url = absoluteUrl(`/articles/${typed.slug || slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: typed.published_at || undefined,
      modifiedTime: typed.updated_at || typed.published_at || undefined,
      authors: typed.author_name || typed.author ? [typed.author_name || typed.author || SITE.name] : [SITE.name],
      section: typed.subcategory || typed.category || "News",
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

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !article) notFound();

  const typed = article as Article;
  const image = typed.image_url || typed.cover_image_url || typed.og_image_url;
  const author = displayAuthor(typed) || typed.author_name || typed.author || SITE.name;
  const publishedDate = displayDate(typed.published_at);
  const modifiedDate = displayDate(typed.updated_at);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <NewsArticleJsonLd article={typed} />

      <Link href="/articles" className="text-sm font-bold text-hgnBlue hover:underline">
        {`← ${articleBackLabel(typed)}`}
      </Link>

      <article className="mt-6 rounded-2xl bg-white p-6 shadow-sm md:p-10">
        <div className="text-sm font-black uppercase tracking-wide text-hgnBlue">
          {typed.column_name || typed.subcategory || typed.category || "News"}
        </div>

        <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 md:text-5xl">
          {typed.title}
        </h1>

        <div className="mt-4 border-b border-slate-200 pb-5 text-sm text-slate-600">
          <span>By {author}</span>
          {publishedDate ? <span>{" "}· Published {publishedDate}</span> : null}
          {modifiedDate && modifiedDate !== publishedDate ? <span>{" "}· Updated {modifiedDate}</span> : null}
        </div>

        {image && (
          <figure className="mt-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={typed.image_alt || typed.title || "Article image"}
              className="max-h-[560px] w-full rounded-xl object-cover"
            />
            {(typed.image_caption || typed.image_credit) && (
              <figcaption className="mt-2 text-sm text-slate-500">
                {typed.image_caption}
                {typed.image_credit ? ` Photo: ${typed.image_credit}` : ""}
              </figcaption>
            )}
          </figure>
        )}

        <ListenToArticle title={typed.title || "Article"} text={typed.body || typed.content || typed.excerpt || ""} />
        <div
          className="article-body mt-8 text-lg leading-8 text-slate-800"
          dangerouslySetInnerHTML={{ __html: typed.body || typed.content || "" }}
        />
      </article>

      <section className="mx-auto my-10 max-w-5xl px-0">
        <AdSlot placement="article_bottom" fallbackHouseAd />
      </section>

      <section className="mt-8 space-y-4">
        <ArticleShare title={typed.title || "Article"} />
      </section>
      <RelatedArticles article={typed} />
    </main>
  );
}
