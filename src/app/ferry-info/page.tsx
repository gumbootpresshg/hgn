import ExternalLinkDisclaimer from "@/components/ExternalLinkDisclaimer"
import { ferryRoutes } from "@/lib/hgn-live-links"

export default function FerryInfoPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Explore Haida Gwaii</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Ferry Info</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Current conditions, schedules, service notices and useful contacts for Haida Gwaii ferry travel.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {ferryRoutes.map((route) => (
          <article key={route.title} className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-xs font-bold tracking-[0.18em] text-hgnBlue">BC Ferries Route</p>
            <h2 className="mt-2 text-2xl font-black">{route.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{route.description}</p>

            <div className="mt-5 grid gap-2 text-sm font-bold text-hgnBlue">
              <a href={route.currentConditions} target="_blank" rel="noreferrer">Current conditions →</a>
              <a href={route.reverseConditions} target="_blank" rel="noreferrer">Reverse direction conditions →</a>
              <a href={route.schedule} target="_blank" rel="noreferrer">Schedule →</a>
              <a href={route.notices} target="_blank" rel="noreferrer">Service notices →</a>
              <a href={`tel:${route.phone.replace(/[^0-9]/g, "")}`}>BC Ferries phone: {route.phone}</a>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm">
        <h2 className="text-2xl font-black">Travel tip</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          For same-day travel, always check BC Ferries current conditions before leaving for the terminal. Weather and marine conditions can affect sailings.
        </p>
      </section>
              <ExternalLinkDisclaimer />
        </main>
  )
}
