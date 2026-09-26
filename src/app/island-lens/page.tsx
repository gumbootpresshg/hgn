import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { dateLabel, IslandLensItem, lensPhotos, publicLensStatuses } from "@/lib/island-lens"

export const revalidate = 60

export default async function IslandLensPage() {
  const { data, error } = await supabase.from("island_lens_items").select("*").in("status", publicLensStatuses).order("featured", { ascending: false }).order("published_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(100)
  const items = (data || []) as IslandLensItem[]; const featured = items[0]; const rest = items.slice(1)
  return <main className="newspaper-shell py-7">
    <header className="border-b border-stone-900 pb-6"><p className="newspaper-kicker text-hgnRed">Photos & video</p><h1 className="mt-2 font-serif text-5xl font-bold tracking-tight sm:text-6xl">Island Lens</h1><p className="mt-3 max-w-3xl text-lg leading-7 text-stone-600">Photo features from Haida Gwaii: print-style spreads, events, sport, weather and the moments that make the islands feel like home.</p></header>
    {error ? <p className="mt-6 border border-amber-200 bg-amber-50 p-5 text-amber-900">Island Lens could not load right now.</p> : null}
    {!items.length ? <section className="mt-7 border border-dashed border-stone-300 p-8"><h2 className="font-serif text-3xl font-bold">The first photo feature is coming soon.</h2><p className="mt-2 text-stone-600">Island Lens will collect HGN’s photo spreads and community galleries in one place.</p></section> : <>
      {featured ? <Link href={`/island-lens/${featured.slug}`} className="group mt-7 grid overflow-hidden border border-stone-300 bg-stone-950 text-white md:grid-cols-[1.25fr_.75fr]"><div className="min-h-[18rem] bg-stone-800">{lensPhotos(featured)[0]?.url ? <img src={lensPhotos(featured)[0].url} alt={lensPhotos(featured)[0].alt || featured.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.015]" /> : null}</div><div className="flex flex-col justify-end p-6 sm:p-8"><p className="newspaper-kicker text-stone-300">{featured.event_date ? dateLabel(featured.event_date) : "Featured photo feature"}</p><h2 className="mt-3 font-serif text-4xl font-bold leading-[1.03] group-hover:text-stone-200">{featured.title}</h2>{featured.description ? <p className="mt-4 leading-7 text-stone-200">{featured.description}</p> : null}<span className="mt-6 text-xs font-bold uppercase tracking-[.14em]">Open photo feature →</span></div></Link> : null}
      {rest.length ? <section className="mt-9 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">{rest.map((item) => { const cover = lensPhotos(item)[0]; return <Link key={item.id} href={`/island-lens/${item.slug}`} className="group block border-t border-stone-900 pt-3"><div className="aspect-[4/3] overflow-hidden bg-stone-200">{cover?.url ? <img src={cover.url} alt={cover.alt || item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" /> : null}</div><p className="mt-3 text-[11px] font-bold uppercase tracking-[.12em] text-hgnRed">{item.community || "Haida Gwaii"}{item.event_date ? ` · ${dateLabel(item.event_date)}` : ""}</p><h2 className="mt-1 font-serif text-2xl font-bold leading-tight group-hover:text-hgnRed">{item.title}</h2>{item.description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{item.description}</p> : null}<p className="mt-3 text-xs font-bold uppercase tracking-[.12em]">View photos →</p></Link> })}</section> : null}
    </>}
  </main>
}
