import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { SitePageRenderer } from "@/components/cms/SitePageRenderer"

export const revalidate = 30

export default async function ManagedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data } = await supabase.from("hgn_site_pages").select("*").eq("slug", slug).eq("status", "published").eq("visibility", "public").maybeSingle()
  if (!data) notFound()
  return <main className="mx-auto max-w-5xl px-4 py-10"><p className="text-sm font-black uppercase tracking-[.2em] text-hgnBlue">{data.eyebrow || "Haida Gwaii News"}</p><h1 className="mt-2 font-serif text-5xl font-bold text-hgnNavy">{data.title}</h1>{data.description&&<p className="mt-3 max-w-3xl text-lg text-slate-600">{data.description}</p>}<section className="mt-8 rounded-3xl border bg-white p-7 shadow-sm"><SitePageRenderer blocks={Array.isArray(data.blocks)?data.blocks:[]}/></section></main>
}
