export type ImageMeta = {
  caption?: string | null;
  credit?: string | null;
  alt_text?: string | null;
};

export function imageAlt(title?: string | null, alt?: string | null) {
  return (alt && alt.trim()) || (title && title.trim()) || "Haida Gwaii News image";
}

export function imageCredit(credit?: string | null) {
  return credit?.trim() || "Haida Gwaii News";
}

export function normalizeImageUrl(url?: string | null) {
  if (!url || !url.trim()) return "/news-placeholder.jpg";
  return url.trim();
}
