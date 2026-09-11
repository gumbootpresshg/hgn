import LiveTideCards from "@/components/LiveTideCards"
import { tideStations } from "@/lib/haida-weather-data"

export default function TideCards({ station, stationSlug }: { station: string; stationSlug?: string }) {
  const found = tideStations.find((item) => item.name === station || item.slug === stationSlug)
  return <LiveTideCards stationSlug={stationSlug || found?.slug || "masset"} stationName={station} />
}
