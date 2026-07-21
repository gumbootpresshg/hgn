import "leaflet/dist/leaflet.css"
import IslandGuideMap from "@/components/guide/IslandGuideMap"
import { guidePlaces } from "@/lib/guide-places"

export const metadata = { title: "Island Map" }

export default async function GuideMapPage({ searchParams }: { searchParams?: Promise<{ category?: string }> }) {
  const params = await searchParams
  return <main className="mx-auto max-w-[1480px] space-y-6 px-4 py-8 md:px-7">
    <header className="max-w-4xl">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-hgnBlue">Haida Gwaii Guide</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">Island Map</h1>
      <p className="mt-4 text-lg leading-8 text-slate-600">Find beaches, fuel, rest stops, transportation, cultural places and essential services. Locations are a curated starting point and should be confirmed before remote travel.</p>
    </header>
    <IslandGuideMap places={guidePlaces} initialCategory={params?.category || "All"} />
  </main>
}
