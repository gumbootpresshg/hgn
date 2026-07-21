import { windyEmbedUrl } from "@/lib/haida-weather-data"

export default function WeatherEmbed({
  title,
  lat,
  lon,
}: {
  title: string
  lat: number
  lon: number
}) {
  return (
    <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="border-b p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">Live Weather Map</p>
        <h2 className="mt-1 text-2xl font-black">{title}</h2>
      </div>
      <iframe
        title={`${title} Windy weather map`}
        src={windyEmbedUrl(lat, lon)}
        className="h-[420px] w-full"
        loading="lazy"
      />
    </section>
  )
}
