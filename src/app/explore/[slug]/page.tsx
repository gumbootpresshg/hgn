import Link from "next/link"
import { communities, directoryEntries } from "@/lib/explore-data"

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const community = communities.find((item) => item.slug === slug)

  if (!community) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-3xl border bg-white p-8 shadow-sm">Community not found.</div>
      </main>
    )
  }

  const entries = directoryEntries.filter(
    (entry) => entry.community.toLowerCase().includes(community.name.toLowerCase()) || community.name.toLowerCase().includes(entry.community.toLowerCase())
  )

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Community</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight">{community.name}</h1>
        <p className="mt-4 max-w-3xl text-slate-600">{community.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {community.highlights.map((item) => (
            <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{item}</span>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Travel & Access</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
            {community.travel.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Services & Notes</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
            {community.services.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-3xl font-black">Directory Entries</h2>
          <Link href={`/explore/directory?community=${encodeURIComponent(community.name)}`} className="text-sm font-bold text-hgnBlue">View filtered directory →</Link>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-3xl border bg-white p-6 shadow-sm text-slate-600">
            Directory listings for this community are being expanded.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {entries.map((entry) => (
              <article key={entry.name} className="rounded-3xl border bg-white p-6 shadow-sm">
                <span className="rounded-full bg-hgnBlue/10 px-3 py-1 text-xs font-black text-hgnBlue">{entry.category}</span>
                <h3 className="mt-4 text-2xl font-black">{entry.name}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{entry.description}</p>
                {entry.website ? <a href={entry.website} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-bold text-hgnBlue">Open link →</a> : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
