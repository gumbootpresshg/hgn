export type HgnAuthor = {
  id: string;
  display_name: string;
  slug: string;
  short_bio?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  writer_type?: string | null;
  public_email?: string | null;
  website_url?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
};

export type HgnColumn = {
  id: string;
  display_name?: string | null;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  author_id?: string | null;
  author_match?: string | null;
  category_match?: string | null;
  section_match?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
};

export function writerSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
