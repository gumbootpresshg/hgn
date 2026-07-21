const PLACEHOLDER_PATTERNS = [
  "/news-placeholder.svg",
  "/news-placeholder.jpg",
  "/hgn-logo.png",
  "/hgn-monogram.png",
  "/icon.png",
]

export function getArticleImage(article: any): string | null {
  const value = article?.image_url || article?.featured_image_url || article?.hero_image_url || article?.cover_image_url || article?.thumbnail_url || article?.photo_url || article?.main_image_url || article?.image || null
  if (!value || typeof value !== "string") return null
  const normalized = value.trim()
  if (!normalized) return null
  if (PLACEHOLDER_PATTERNS.some((pattern) => normalized.includes(pattern))) return null
  return normalized
}

export function hasArticleImage(article: any) {
  return Boolean(getArticleImage(article))
}
