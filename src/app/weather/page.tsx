import Link from "next/link"
import WeatherEmbed from "@/components/WeatherEmbed"
import { tideStations, weatherLocations } from "@/lib/haida-weather-data"

const main = weatherLocations.find((location) => location.slug === "skidegate") || weatherLocations[0]

export default function WeatherPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Weather</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">Haida Gwaii Weather Desk</h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          Forecasts, wind maps, marine weather, tide stations, power outages and emergency links for Haida Gwaii.
        </p>
      </section>

      <WeatherEmbed title="Haida Gwaii Wind & Weather" lat={main.lat} lon={main.lon} />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {weatherLocations.map((location) => (
          <Link key={location.slug} href={`/weather/${location.slug}`} className="rounded-3xl border bg-white p-6 shadow-sm hover:border-hgnBlue">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">Local Forecast</p>
            <h2 className="mt-2 text-2xl font-black">{location.name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Forecast, wind map, marine links, tides and alerts for {location.name}.
            </p>
          </Link>
        ))}
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">Tide Desk</p>
            <h2 className="text-3xl font-black">Local Tide Stations</h2>
          </div>
          <Link href="/weather/tides" className="text-sm font-bold text-hgnBlue">Open Tide Desk →</Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tideStations.map((station) => (
            <Link key={station.slug} href={`/weather/tides/${station.slug}`} className="rounded-2xl border p-5 hover:border-hgnBlue">
              <h3 className="text-xl font-black">{station.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{station.area}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Quick href="/explore/live/power-outages" title="Power Outages" />
        <Quick href="/weather/earthquakes" title="Earthquakes" />
        <Quick href="/weather/tsunami-alerts" title="Tsunami Alerts" />
        <Quick href="/explore/live" title="Live Utilities" />
      </section>
    </main>
  )
}

function Quick({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href} className="rounded-3xl border bg-slate-950 p-5 text-white shadow-sm hover:border-hgnBlue">
      <h2 className="text-xl font-black">{title}</h2>
      <p className="mt-2 text-sm text-slate-300">Open desk →</p>
    </Link>
  )
}
