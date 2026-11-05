const PLACEHOLDER_PATTERNS = [
  "/news-placeholder.svg",
  "/news-placeholder.jpg",
  "/hgn-logo.png",
  "/hgn-monogram.png",
  "/icon.png",
  "hgn-social-share.png",
]

const HERO_IMAGE_FIELDS = [
  "image_url",
  "featured_image_url",
  "hero_image_url",
  "cover_image_url",
  "thumbnail_url",
  "photo_url",
  "main_image_url",
  "image",
] as const

function storyImageValue(value: unknown): string | null {
  if (typeof value !== "string") return null
  const normalized = value.trim()
  if (!normalized || normalized.startsWith("blob:")) return null
  if (PLACEHOLDER_PATTERNS.some((pattern) => normalized.includes(pattern))) return null
  return normalized
}

type ArticleImageSource = {
  image_url?: unknown
  featured_image_url?: unknown
  hero_image_url?: unknown
  cover_image_url?: unknown
  thumbnail_url?: unknown
  photo_url?: unknown
  main_image_url?: unknown
  image?: unknown
  og_image_url?: unknown
} | null | undefined

function firstStoryImage(article: ArticleImageSource, fields: readonly (keyof NonNullable<ArticleImageSource>)[]): string | null {
  if (!article) return null
  for (const field of fields) {
    const image = storyImageValue(article[field])
    if (image) return image
  }
  return null
}

export function getArticleImage(article: ArticleImageSource): string | null {
  return firstStoryImage(article, HERO_IMAGE_FIELDS)
}

// NewsArticle and og:image should use the featured photo. A social or logo
// image is not a story photo, even when it was copied into og_image_url.
export function articleStoryImage(article: ArticleImageSource): string | null {
  return getArticleImage(article) || storyImageValue(article?.og_image_url)
}

export function hasArticleImage(article: ArticleImageSource) {
  return Boolean(getArticleImage(article))
}
