import ExternalLinkDisclaimer from "@/components/ExternalLinkDisclaimer"
import TsunamiAlertBanner from "@/components/TsunamiAlertBanner"

export default function TsunamiAlertsPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Emergency Desk</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">Tsunami Alerts</h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          Live Environment Canada tsunami alert status for Zone A: the North Coast and Haida Gwaii.
        </p>
      </section>

      <TsunamiAlertBanner compact />

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="text-2xl font-black">If you feel strong shaking</h2>
        <p className="mt-3 text-sm leading-7">
          Drop, cover and hold on. When shaking stops, move to high ground or inland if you are near the coast.
          Follow official alerts and local emergency instructions.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <a href="https://weather.gc.ca/warnings/report_tsunami_e.html?mesoCode=tsu1" target="_blank" rel="noreferrer" className="rounded-3xl border bg-white p-6 shadow-sm hover:border-hgnBlue">
          <h2 className="text-2xl font-black">Environment Canada Official Tsunami Page</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Official tsunami alert status for Zone A: the North Coast and Haida Gwaii.</p>
        </a>
        <a href="https://www.emergencyinfobc.gov.bc.ca/" target="_blank" rel="noreferrer" className="rounded-3xl border bg-white p-6 shadow-sm hover:border-hgnBlue">
          <h2 className="text-2xl font-black">EmergencyInfoBC</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Provincial emergency updates and public safety information.</p>
        </a>
      </section>
              <ExternalLinkDisclaimer />
        </main>
  )
}
