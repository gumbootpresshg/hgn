import Link from "next/link"
import { communities, directoryEntries, emergencyContacts, exploreCategories, sourceLinks } from "@/lib/explore-data"

export default function ExplorePage() {
  const featured = directoryEntries.slice(0, 8)

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-6 py-8">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Explore Haida Gwaii</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight">Explore Haida Gwaii</h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          Communities, travel tools, official links, emergency resources, cultural anchors and local services across Haida Gwaii.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/explore/directory" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Directory</Link>
          <Link href="/ferry-info" className="rounded-full border px-5 py-3 text-sm font-bold">Ferry Info</Link>
          <Link href="/weather" className="rounded-full border px-5 py-3 text-sm font-bold">Weather Desk</Link>
          <Link href="/weather/tides" className="rounded-full border px-5 py-3 text-sm font-bold">Tides</Link>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-3xl font-black">Communities</h2>
          <Link href="/explore/directory" className="text-sm font-bold text-hgnBlue">Full Directory →</Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {communities.map((community) => (
            <Link key={community.slug} href={`/explore/${community.slug}`} className="rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-hgnBlue">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">Community</p>
              <h3 className="mt-2 text-2xl font-black">{community.name}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{community.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {community.highlights.map((item) => (
                  <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{item}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Explore Categories</h2>
          <div className="mt-5 space-y-3">
            {exploreCategories.map((category) => (
              <Link key={category.slug} href={`/explore/directory?category=${encodeURIComponent(category.title)}`} className="block rounded-2xl bg-slate-50 px-4 py-3 hover:bg-slate-100">
                <p className="font-black">{category.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black">Featured Resources</h2>
            <Link href="/explore/directory" className="text-sm font-bold text-hgnBlue">View all →</Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {featured.map((entry) => (
              <article key={entry.name} className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-hgnBlue/10 px-3 py-1 text-xs font-black text-hgnBlue">{entry.category}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{entry.community}</span>
                </div>
                <h3 className="mt-4 text-2xl font-black">{entry.name}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{entry.description}</p>
                {entry.website ? <a href={entry.website} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-bold text-hgnBlue">Open official link →</a> : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border bg-slate-950 p-8 text-white shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">Emergency & Utilities</p>
            <h2 className="mt-2 text-3xl font-black">Important Contacts</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Quick access to emergency and travel-related resources across Haida Gwaii.
            </p>
          </div>
          <div className="grid gap-3">
            {emergencyContacts.map((item) => (
              <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 hover:border-hgnBlue">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">{item.label}</p>
                <p className="mt-2 text-lg font-black">{item.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black">Official Source Links</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {sourceLinks.map((source) => (
            <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="rounded-2xl border p-4 hover:border-hgnBlue">
              <p className="font-black">{source.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{source.description}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}
