import Link from "next/link"
import TideCards from "@/components/TideCards"
import WeatherEmbed from "@/components/WeatherEmbed"
import { tideStations } from "@/lib/haida-weather-data"

export default async function TideStationPage({ params }: { params: Promise<{ station: string }> }) {
  const { station } = await params
  const item = tideStations.find((stationItem) => stationItem.slug === station)
  const name = item?.name || station.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Tide Station</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">{name}</h1>
        <p className="mt-3 text-slate-600">
          Live high/low tide cards, wind map and official tide-table links for {name}.
        </p>
      </section>

      <TideCards station={name} stationSlug={station} />

      {item ? <WeatherEmbed title={`${name} Wind & Marine Conditions`} lat={item.lat} lon={item.lon} /> : null}

      <section className="rounded-3xl border bg-slate-50 p-6">
        <h2 className="text-2xl font-black">Official sources</h2>
        <div className="mt-4 grid gap-2 text-sm font-bold text-hgnBlue">
          {item ? <a href={item.officialUrl} target="_blank" rel="noreferrer">Official station page</a> : null}
          <a href="https://tides.gc.ca/en/stations" target="_blank" rel="noreferrer">Official Canadian tide stations</a>
          <a href="https://weather.gc.ca/marine/" target="_blank" rel="noreferrer">Marine weather forecasts</a>
          <a href="https://www.waterlevels.gc.ca/" target="_blank" rel="noreferrer">Water Levels Canada</a>
        </div>
      </section>

      <Link href="/weather/tides" className="inline-flex text-sm font-bold text-hgnBlue">← Back to Tide Desk</Link>
    </main>
  )
}
