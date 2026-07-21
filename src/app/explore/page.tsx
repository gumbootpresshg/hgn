import Link from "next/link"
import { communities, emergencyContacts } from "@/lib/explore-data"
import { guideQuickLinks } from "@/lib/guide-places"
import { getPublishedGuidePlaces } from "@/lib/guide-db"

export const metadata = { title: "Haida Gwaii Guide", description: "A practical island guide for residents and visitors, built into Haida Gwaii News." }

export default async function ExplorePage() {
  const guidePlaces = await getPublishedGuidePlaces()
  const featured = guidePlaces.filter((place) => place.featured).slice(0, 6)
  return <main className="mx-auto max-w-[1480px] space-y-10 px-4 py-8 md:px-7">
    <section className="overflow-hidden rounded-[2rem] border border-stone-300 bg-[#fffefa] shadow-sm">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className="p-7 md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-hgnBlue">Inside Haida Gwaii News</p>
          <h1 className="mt-3 font-serif text-5xl font-bold leading-none tracking-tight md:text-7xl">Haida Gwaii Guide</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">One island companion for daily life and travel: ferries, beaches, fuel, rest stops, cameras, communities, weather and essential services.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link href="/explore/map" className="rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white">Open Island Map</Link><Link href="/explore/travel" className="rounded-full border border-stone-400 px-6 py-3 text-sm font-bold">Ferries & Travel</Link><Link href="/explore/cams" className="rounded-full border border-stone-400 px-6 py-3 text-sm font-bold">Island Cams</Link></div>
        </div>
        <div className="grid grid-cols-2 border-t border-stone-300 bg-stone-950 p-5 text-white lg:border-l lg:border-t-0">
          {guideQuickLinks.slice(0, 6).map((item) => <Link key={item.href} href={item.href} className="border border-white/10 p-5 transition hover:bg-white/10"><p className="font-serif text-xl font-bold">{item.title}</p><p className="mt-2 text-xs leading-5 text-stone-300">{item.description}</p></Link>)}
        </div>
      </div>
    </section>

    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{featured.map((place) => <article key={place.id} className="rounded-3xl border bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.17em] text-hgnBlue">{place.category} · {place.community}</p><h2 className="mt-2 font-serif text-3xl font-bold">{place.name}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{place.description}</p>{place.caution ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">{place.caution}</p> : null}<Link href={`/explore/map?category=${encodeURIComponent(place.category)}`} className="mt-5 inline-flex text-sm font-bold text-hgnBlue">View on guide map →</Link></article>)}</section>

    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-hgnBlue">Across the islands</p><h2 className="mt-1 font-serif text-4xl font-bold">Communities</h2></div><Link href="/explore/directory" className="text-sm font-bold text-hgnBlue">Full directory →</Link></div><div className="grid gap-3 sm:grid-cols-2">{communities.map((community) => <Link key={community.slug} href={`/explore/${community.slug}`} className="rounded-2xl border bg-white p-5 hover:border-hgnBlue"><h3 className="font-serif text-2xl font-bold">{community.name}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{community.description}</p></Link>)}</div></div>
      <aside className="rounded-3xl bg-stone-950 p-7 text-white"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">Essential now</p><h2 className="mt-2 font-serif text-4xl font-bold">Quick contacts</h2><div className="mt-5 space-y-3">{emergencyContacts.map((item) => <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined} className="block rounded-2xl border border-white/10 p-4 hover:border-sky-300"><p className="text-xs uppercase tracking-wider text-white/55">{item.label}</p><p className="mt-1 font-bold">{item.value}</p></a>)}</div><p className="mt-5 text-xs leading-5 text-stone-400">Live information remains linked to its official source and should be checked before travel or emergency decisions.</p></aside>
    </section>
  </main>
}
