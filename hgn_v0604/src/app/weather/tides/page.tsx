import ExternalLinkDisclaimer from "@/components/ExternalLinkDisclaimer"
import Link from "next/link"
import TideCards from "@/components/TideCards"
import { tideStations } from "@/lib/haida-weather-data"

export default function TidesPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Marine Desk</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">Haida Gwaii Tide Desk</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Live high/low tide cards using Canadian Hydrographic Service prediction data, plus official station links.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {tideStations.map((station) => (
          <article key={station.slug} className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">Tide Station</p>
              <h2 className="mt-2 text-2xl font-black">{station.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{station.area}</p>
            </div>
            <TideCards station={station.name} stationSlug={station.slug} />
            <div className="flex flex-wrap gap-2">
              <Link href={`/weather/tides/${station.slug}`} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white">Station Page</Link>
              <a href={station.officialUrl} target="_blank" rel="noreferrer" className="rounded-full border px-4 py-2 text-sm font-bold">Official Tables</a>
            </div>
          </article>
        ))}
      </section>
              <ExternalLinkDisclaimer />
        </main>
  )
}
