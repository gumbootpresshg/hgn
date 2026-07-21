import Link from "next/link"
import WeatherEmbed from "@/components/WeatherEmbed"
import { weatherLocations } from "@/lib/haida-weather-data"

export default function TownWeatherPage() {
  const location = weatherLocations.find((item) => item.slug === "old-massett") || weatherLocations[0]

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Local Forecast</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">{location.name} Weather</h1>
        <p className="mt-3 text-slate-600">
          Forecast links, Windy-style map, marine weather, tides and alerts for {location.name}.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <a href={location.forecastUrl} target="_blank" rel="noreferrer" className="rounded-2xl border bg-white p-5 shadow-sm hover:border-hgnBlue">
          <p className="text-xs font-bold tracking-[0.18em] text-slate-500">Forecast</p>
          <p className="mt-2 text-2xl font-black">Environment Canada</p>
          <p className="mt-2 text-sm text-slate-600">Open official local forecast.</p>
        </a>
        <a href={location.marineUrl} target="_blank" rel="noreferrer" className="rounded-2xl border bg-white p-5 shadow-sm hover:border-hgnBlue">
          <p className="text-xs font-bold tracking-[0.18em] text-slate-500">Marine</p>
          <p className="mt-2 text-2xl font-black">Marine Weather</p>
          <p className="mt-2 text-sm text-slate-600">Check wind and waters before travel.</p>
        </a>
        <Link href="/weather/tides" className="rounded-2xl border bg-white p-5 shadow-sm hover:border-hgnBlue">
          <p className="text-xs font-bold tracking-[0.18em] text-slate-500">Tides</p>
          <p className="mt-2 text-2xl font-black">Tide Desk</p>
          <p className="mt-2 text-sm text-slate-600">High/low tide station desk.</p>
        </Link>
      </section>

      <WeatherEmbed title={`${location.name} Wind & Weather`} lat={location.lat} lon={location.lon} />

      <section className="rounded-3xl border bg-slate-50 p-6">
        <h2 className="text-2xl font-black">Alerts & Utilities</h2>
        <div className="mt-4 grid gap-2 text-sm font-bold text-hgnBlue">
          <Link href="/explore/live/power-outages">Power Outages</Link>
          <Link href="/weather/earthquakes">Earthquakes</Link>
          <Link href="/weather/tsunami-alerts">Tsunami Alerts</Link>
          <Link href="/explore/live">Live Utilities</Link>
        </div>
      </section>

      <Link href="/weather" className="inline-flex text-sm font-bold text-hgnBlue">← Back to Weather Desk</Link>
    </main>
  )
}
