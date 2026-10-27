import type { Metadata } from "next"
import { absoluteUrl, SITE } from "@/lib/site"

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = absoluteUrl(path)
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "en_CA", siteName: SITE.name, title, description, url, images: [{ url: absoluteUrl(SITE.defaultImage), width: 1200, height: 630, alt: SITE.name }] },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl(SITE.defaultImage)] },
  }
}
