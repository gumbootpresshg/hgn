import type { ReactNode } from "react"
import { SitePageRenderer } from "@/components/cms/SitePageRenderer"
import { loadPublicSitePage, type SitePageBlock } from "@/lib/cms/site-pages"

type ManagedInfoPageProps = {
  systemKey: string
  fallback: { title: string; eyebrow?: string; description?: string; blocks: SitePageBlock[] }
  children?: ReactNode
}

export async function ManagedInfoPage({ systemKey, fallback, children }: ManagedInfoPageProps) {
  const data = await loadPublicSitePage(systemKey)
  const page = data || fallback

  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
    <p className="text-sm font-black uppercase tracking-[.2em] text-hgnBlue">{page.eyebrow || "Haida Gwaii News"}</p>
    <h1 className="mt-2 font-serif text-4xl font-bold leading-tight text-hgnNavy sm:text-5xl">{page.title}</h1>
    {page.description ? <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{page.description}</p> : null}
    <section className="mt-8 rounded-3xl border border-stone-300 bg-white p-6 shadow-sm sm:p-8"><SitePageRenderer blocks={Array.isArray(page.blocks) ? page.blocks : fallback.blocks}/></section>
    {children}
  </main>
}
