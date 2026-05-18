import { absoluteUrl, SITE, stripHtml } from "@/lib/site";

type Article = {
  title?: string;
  seo_title?: string | null;
  excerpt?: string | null;
  meta_description?: string | null;
  slug?: string;
  author_name?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  image_url?: string | null;
  og_image_url?: string | null;
  image_alt?: string | null;
};

export default function NewsArticleJsonLd({ article }: { article: Article }) {
  const headline = article.seo_title || article.title || "Haida Gwaii News";
  const description = article.meta_description || stripHtml(article.excerpt || "");
  const image = article.og_image_url || article.image_url || SITE.defaultImage;
  const url = article.slug ? absoluteUrl(`/articles/${article.slug}`) : SITE.url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline,
    description,
    image: [absoluteUrl(image)],
    datePublished: article.published_at || undefined,
    dateModified: article.updated_at || article.published_at || undefined,
    author: [{ "@type": "Person", name: article.author_name || "Haida Gwaii News" }],
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/hgn-logo.png"),
      },
    },
    mainEntityOfPage: url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
