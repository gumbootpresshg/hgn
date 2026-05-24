import { absoluteUrl, SITE, stripHtml } from "@/lib/site";

type Article = {
  title?: string;
  seo_title?: string | null;
  excerpt?: string | null;
  meta_description?: string | null;
  slug?: string;
  author?: string | null;
  author_name?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  image_url?: string | null;
  cover_image_url?: string | null;
  og_image_url?: string | null;
  image_alt?: string | null;
  category?: string | null;
  subcategory?: string | null;
  column_name?: string | null;
};

export default function NewsArticleJsonLd({ article }: { article: Article }) {
  const headline = article.seo_title || article.title || SITE.name;
  const description =
    article.meta_description ||
    stripHtml(article.excerpt || "").slice(0, 180) ||
    SITE.description;
  const image = article.og_image_url || article.cover_image_url || article.image_url || SITE.defaultImage;
  const url = article.slug ? absoluteUrl(`/articles/${article.slug}`) : SITE.url;
  const authorName = article.author_name || article.author || SITE.name;
  const section = article.subcategory || article.category || "News";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline,
    description,
    image: [absoluteUrl(image)],
    datePublished: article.published_at || undefined,
    dateModified: article.updated_at || article.published_at || undefined,
    author: [{ "@type": "Person", name: authorName }],
    publisher: {
      "@type": "NewsMediaOrganization",
      name: SITE.name,
      url: SITE.url,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/hgn-logo.png"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    articleSection: section,
    keywords: [article.category, article.subcategory, article.column_name, "Haida Gwaii", "local news"].filter(Boolean),
    isAccessibleForFree: true,
    inLanguage: "en-CA",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
