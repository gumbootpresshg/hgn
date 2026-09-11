import ExternalLinkDisclaimer from "@/components/ExternalLinkDisclaimer"
import Link from "next/link"
import {
  airportInfo,
  emergencyFeeds,
  ferryRoutes,
  powerOutageLinks,
  roadConditionLinks,
  tideStations,
  weatherStations,
} from "@/lib/live-utilities"

export default function LiveUtilitiesPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Live Utilities</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight">Island Utilities & Live Information</h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          Ferry conditions, power outages, roads, weather, tides, airports, earthquakes and emergency information across Haida Gwaii.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <UtilityCard title="Power Outages">
          <div className="grid gap-4">
            {powerOutageLinks.map((link) => (
              <a key={link.title} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer" : undefined} className="rounded-2xl border p-4 hover:border-hgnBlue">
                <h3 className="font-black">{link.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{link.description}</p>
              </a>
            ))}
          </div>
          <Link href="/explore/live/power-outages" className="mt-4 inline-flex text-sm font-bold text-hgnBlue">
            Open Power Outage Desk →
          </Link>
        </UtilityCard>

        <UtilityCard title="Road Conditions">
          <div className="grid gap-4">
            {roadConditionLinks.map((link) => (
              <a key={link.title} href={link.href} target="_blank" rel="noreferrer" className="rounded-2xl border p-4 hover:border-hgnBlue">
                <h3 className="font-black">{link.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{link.description}</p>
              </a>
            ))}
          </div>
        </UtilityCard>

        <UtilityCard title="Ferry Conditions">
          {ferryRoutes.map((route) => (
            <div key={route.name} className="rounded-2xl border p-4">
              <h3 className="text-lg font-black">{route.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{route.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {route.links.map((link) => (
                  <a key={link.href + link.label} href={link.href} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold hover:text-hgnBlue">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </UtilityCard>

        <UtilityCard title="Weather Stations">
          <div className="grid gap-3">
            {weatherStations.map((station) => (
              <a key={station.name} href={station.href} target="_blank" rel="noreferrer" className="rounded-2xl border p-4 font-bold hover:border-hgnBlue">
                {station.name}
              </a>
            ))}
          </div>
        </UtilityCard>

        <UtilityCard title="Tide Stations">
          <div className="grid gap-3">
            {tideStations.map((station) => (
              <a key={station.name} href={station.href} target="_blank" rel="noreferrer" className="rounded-2xl border p-4 font-bold hover:border-hgnBlue">
                {station.name}
              </a>
            ))}
          </div>
        </UtilityCard>

        <UtilityCard title="Emergency & Alerts">
          <div className="grid gap-4">
            {emergencyFeeds.map((feed) => (
              <a key={feed.title} href={feed.href} target="_blank" rel="noreferrer" className="rounded-2xl border p-4 hover:border-hgnBlue">
                <h3 className="font-black">{feed.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{feed.description}</p>
              </a>
            ))}
          </div>
        </UtilityCard>
      </section>

      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Travel</p>
            <h2 className="mt-2 text-3xl font-black">Airports & Transportation</h2>
          </div>
          <Link href="/explore" className="text-sm font-bold text-hgnBlue">Explore →</Link>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {airportInfo.map((airport) => (
            <a key={airport.name} href={airport.href} target="_blank" rel="noreferrer" className="rounded-3xl border p-6 hover:border-hgnBlue">
              <h3 className="text-2xl font-black">{airport.name}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{airport.description}</p>
            </a>
          ))}
        </div>
      </section>
              <ExternalLinkDisclaimer />
        </main>
  )
}

function UtilityCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}
