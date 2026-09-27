import Link from "next/link"
import { directoryEntries, exploreCategories } from "@/lib/explore-data"
import { getPublishedGuidePlaces } from "@/lib/guide-db"

export default async function ExploreDirectoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; community?: string; q?: string }>
}) {
  const params = await searchParams
  const category = params?.category || ""
  const community = params?.community || ""
  const q = String(params?.q || "").toLowerCase().trim()
  const guidePlaces = await getPublishedGuidePlaces()
  const guideEntries = guidePlaces.map((place) => ({
    name: place.name, category: place.category, community: place.community, description: place.description, phone: place.phone, website: place.website, tags: ["Guide place", ...(place.amenities || [])], verifiedAt: place.verifiedAt,
  }))
  const allEntries = [...guideEntries, ...directoryEntries.filter((entry) => !guideEntries.some((guide) => guide.name === entry.name))]

  const communities = Array.from(new Set(allEntries.map((entry) => entry.community))).sort()

  const entries = allEntries.filter((entry) => {
    if (category && entry.category !== category) return false
    if (community && entry.community !== community) return false
    if (q) {
      const haystack = `${entry.name} ${entry.category} ${entry.community} ${entry.description} ${(entry.tags || []).join(" ")}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Explore Haida Gwaii</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight">Directory</h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          A growing public directory of mapped Guide places, official resources, transportation, culture and essential services. Businesses are added only after HGN has the information needed to publish them responsibly.
        </p>

        <form action="/explore/directory" className="mt-6 grid gap-3 md:grid-cols-[1fr_0.8fr_0.8fr_auto]">
          <input name="q" defaultValue={params?.q || ""} placeholder="Search directory" className="rounded-2xl border px-4 py-3" />
          <select name="category" defaultValue={category} className="rounded-2xl border px-4 py-3">
            <option value="">All categories</option>
            {[...exploreCategories.map((item) => item.title), ...Array.from(new Set(guideEntries.map((item) => item.category)))].filter((item, index, list) => list.indexOf(item) === index).map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select name="community" defaultValue={community} className="rounded-2xl border px-4 py-3">
            <option value="">All communities</option>
            {communities.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <button className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">Search</button>
        </form>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => (
          <article key={entry.name} className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-hgnBlue/10 px-3 py-1 text-xs font-black text-hgnBlue">{entry.category}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{entry.community}</span>
            </div>
            <h2 className="mt-4 text-2xl font-black">{entry.name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{entry.description}</p>
            {entry.phone ? <p className="mt-3 text-sm font-bold">{entry.phone}</p> : null}
            {"verifiedAt" in entry && entry.verifiedAt ? <p className="mt-3 text-xs font-semibold text-slate-500">Last verified {new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(new Date(entry.verifiedAt))}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {(entry.tags || []).map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{tag}</span>
              ))}
            </div>
            {entry.website ? <a href={entry.website} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-bold text-hgnBlue">Open link →</a> : null}
          </article>
        ))}
      </section>

      {entries.length === 0 ? (
        <p className="rounded-2xl border bg-white p-6 text-slate-600">No directory entries found for those filters.</p>
      ) : null}

      <Link href="/explore" className="inline-flex text-sm font-bold text-hgnBlue">← Back to Explore</Link>
    </main>
  )
}
