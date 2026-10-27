import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { SitePageRenderer } from "@/components/cms/SitePageRenderer"
import { absoluteUrl } from "@/lib/site"

export const revalidate = 30

const primaryRoutes: Record<string, string> = {
  about: "/about", advertise: "/advertise", "community-standards": "/community-standards", contact: "/contact", corrections: "/corrections", membership: "/membership", privacy: "/privacy", subscribe: "/subscribe", support: "/support", terms: "/terms",
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data } = await supabase.from("hgn_site_pages").select("title,description").eq("slug", slug).eq("status", "published").eq("visibility", "public").maybeSingle()
  if (!data) return { title: "Page not found", robots: { index: false, follow: false } }
  const canonical = primaryRoutes[slug] || `/pages/${slug}`
  return { title: data.title, description: data.description || `${data.title} from Haida Gwaii News.`, alternates: { canonical: absoluteUrl(canonical) } }
}

export default async function ManagedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data } = await supabase.from("hgn_site_pages").select("*").eq("slug", slug).eq("status", "published").eq("visibility", "public").maybeSingle()
  if (!data) notFound()
  return <main className="mx-auto max-w-5xl px-4 py-10"><p className="text-sm font-black uppercase tracking-[.2em] text-hgnBlue">{data.eyebrow || "Haida Gwaii News"}</p><h1 className="mt-2 font-serif text-5xl font-bold text-hgnNavy">{data.title}</h1>{data.description&&<p className="mt-3 max-w-3xl text-lg text-slate-600">{data.description}</p>}<section className="mt-8 rounded-3xl border bg-white p-7 shadow-sm"><SitePageRenderer blocks={Array.isArray(data.blocks)?data.blocks:[]}/></section></main>
}
