import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { SITE, absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/articles", "/letters", "/opinion", "/events", "/marketplace", "/obituaries", "/weather", "/games"].map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified: new Date(),
  }));

  const { data: articles } = await supabase
    .from("articles")
    .select("slug,updated_at,published_at,status")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(5000);

  const articleRoutes = (articles || [])
    .filter((a: any) => a.slug)
    .map((a: any) => ({
      url: `${SITE.url.replace(/\/$/, "")}/articles/${a.slug}`,
      lastModified: new Date(a.updated_at || a.published_at || Date.now()),
    }));

  return [...staticRoutes, ...articleRoutes];
}
