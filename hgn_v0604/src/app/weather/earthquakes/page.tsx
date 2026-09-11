import ExternalLinkDisclaimer from "@/components/ExternalLinkDisclaimer"
import EarthquakeAlertBanner from "@/components/EarthquakeAlertBanner"

export default function EarthquakesPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Emergency Desk</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Haida Gwaii Earthquakes</h1>
        <p className="mt-3 text-slate-600">
          Recent regional earthquake feed, monitoring links and preparedness resources for Haida Gwaii.
        </p>
      </section>

      <EarthquakeAlertBanner compact />

      <section className="grid gap-4 md:grid-cols-2">
        <a href="https://earthquakescanada.nrcan.gc.ca/index-en.php?tpl_region=qci" target="_blank" rel="noreferrer" className="rounded-3xl border bg-white p-6 shadow-sm hover:border-hgnBlue">
          <h2 className="text-2xl font-black">Earthquakes Canada — Haida Gwaii Region</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Official regional earthquake information from Earthquakes Canada.</p>
        </a>
        <a href="https://earthquake.usgs.gov/earthquakes/map/" target="_blank" rel="noreferrer" className="rounded-3xl border bg-white p-6 shadow-sm hover:border-hgnBlue">
          <h2 className="text-2xl font-black">USGS Live Earthquake Map</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Interactive global earthquake map and recent seismic events.</p>
        </a>
        <a href="https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc" target="_blank" rel="noreferrer" className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm hover:border-hgnBlue">
          <h2 className="text-2xl font-black">PreparedBC</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">Emergency kits, earthquake safety and preparedness information.</p>
        </a>
      </section>
              <ExternalLinkDisclaimer />
        </main>
  )
}
