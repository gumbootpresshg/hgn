export type LensPhoto = { url: string; caption?: string; credit?: string; alt?: string }

export type IslandLensItem = {
  id: string
  slug: string
  title: string
  description?: string | null
  gallery_intro?: string | null
  gallery_body?: string | null
  media_type?: string | null
  thumbnail_url?: string | null
  community?: string | null
  credit?: string | null
  status?: string | null
  featured?: boolean | null
  event_date?: string | null
  issue_label?: string | null
  issue_url?: string | null
  cover_caption?: string | null
  photo_urls?: string[] | null
  photo_captions?: LensPhoto[] | null
  video_urls?: string[] | null
  published_at?: string | null
  created_at?: string | null
}

export const publicLensStatuses = ["published", "approved", "public", "live", "active"]

export function lensSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 96) || "photo-feature"
}

export function lensPhotos(item: Partial<IslandLensItem>): LensPhoto[] {
  const existing = Array.isArray(item.photo_captions) ? item.photo_captions.filter((photo): photo is LensPhoto => Boolean(photo?.url)) : []
  if (existing.length) return existing
  return (item.photo_urls || []).filter(Boolean).map((url) => ({ url }))
}

export function dateLabel(value?: string | null) {
  if (!value) return ""
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-CA", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Vancouver" }).format(date)
}
