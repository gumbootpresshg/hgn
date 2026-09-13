import { supabase } from "@/lib/supabase"

export type SitePageBlock = {
  id: string
  type: "heading" | "paragraph" | "image" | "quote" | "button" | "divider" | "callout"
  content?: string
  level?: number
  url?: string
  label?: string
  alt?: string
}

export type SitePageRecord = {
  id: string
  slug: string
  title: string
  eyebrow?: string | null
  description?: string | null
  blocks: SitePageBlock[]
  status: string
  visibility: string
  seo_title?: string | null
  seo_description?: string | null
  system_key?: string | null
}

export async function loadPublicSitePage(keyOrSlug: string) {
  const { data } = await supabase
    .from("hgn_site_pages")
    .select("*")
    .eq(keyOrSlug.includes("/") ? "slug" : "slug", keyOrSlug.replace(/^\//, ""))
    .eq("status", "published")
    .eq("visibility", "public")
    .maybeSingle()
  return (data || null) as SitePageRecord | null
}
