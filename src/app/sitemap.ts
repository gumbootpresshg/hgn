import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { SITE, absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPaths = [
    "",
    "/articles",
    "/news",
    "/letters",
    "/opinion",
    "/opinion/editorials",
    "/opinion/on-the-record",
    "/opinion/columns",
    "/opinion/guest-opinion",
    "/events",
    "/marketplace",
    "/obituaries",
    "/weather",
    "/games",
    "/horoscope",
  ];

  const staticRoutes = staticPaths.map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified: now,
  }));

  const { data: articles } = await supabase
    .from("articles")
    .select("slug,updated_at,published_at,status")
    .eq("status", "published")
    .not("slug", "is", null)
    .order("published_at", { ascending: false })
    .limit(5000);

  const articleRoutes = (articles || [])
    .filter((article: any) => article.slug)
    .map((article: any) => ({
      url: `${SITE.url.replace(/\/$/, "")}/articles/${article.slug}`,
      lastModified: new Date(article.updated_at || article.published_at || Date.now()),
    }));

  return [...staticRoutes, ...articleRoutes];
}
