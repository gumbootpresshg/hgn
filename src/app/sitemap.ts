import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { absoluteUrl } from "@/lib/site";

// The main sitemap should reflect a newly published story without waiting for
// the next deployment. It is inexpensive and crawled far less often than pages.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPaths = [
    "", "/articles", "/news", "/letters", "/opinion", "/opinion/editorials", "/opinion/on-the-record",
    "/opinion/columns", "/opinion/guest-opinion", "/sports", "/authors", "/events", "/marketplace",
    "/obituaries", "/weather", "/digital-paper", "/about", "/community-standards", "/request-correction",
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((path) => ({ url: absoluteUrl(path || "/"), lastModified: now }));

  const [{ data: articles }, { data: authors }, { data: pages }] = await Promise.all([
    supabase.from("articles").select("slug,updated_at,published_at,status").eq("status", "published").not("slug", "is", null).order("published_at", { ascending: false }).limit(5000),
    supabase.from("hgn_authors").select("slug,is_active").eq("is_active", true).not("slug", "is", null).limit(500),
    supabase.from("hgn_site_pages").select("slug,updated_at,status,visibility").eq("status", "published").eq("visibility", "public").not("slug", "is", null).limit(1000),
  ]);

  const safeSlug = (value: unknown) => /^[a-z0-9][a-z0-9-]*$/i.test(String(value || "").trim())
  const articleRoutes: MetadataRoute.Sitemap = (articles || []).filter((article: any) => safeSlug(article.slug)).map((article: any) => ({
    url: absoluteUrl(`/articles/${article.slug}`),
    lastModified: new Date(article.updated_at || article.published_at || Date.now()),
  }));
  const authorRoutes: MetadataRoute.Sitemap = (authors || []).filter((author: any) => safeSlug(author.slug)).map((author: any) => ({ url: absoluteUrl(`/authors/${author.slug}`), lastModified: now }));
  const duplicateManagedPageSlugs = new Set(["about", "advertise", "community-standards", "contact", "corrections", "membership", "privacy", "subscribe", "support", "terms"])
  const pageRoutes: MetadataRoute.Sitemap = (pages || []).filter((page: any) => safeSlug(page.slug) && !duplicateManagedPageSlugs.has(page.slug)).map((page: any) => ({ url: absoluteUrl(`/pages/${page.slug}`), lastModified: new Date(page.updated_at || Date.now()) }));

  const seen = new Set<string>();
  return [...staticRoutes, ...articleRoutes, ...authorRoutes, ...pageRoutes].filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
