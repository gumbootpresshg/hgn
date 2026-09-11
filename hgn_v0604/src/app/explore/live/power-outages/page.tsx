import ExternalLinkDisclaimer from "@/components/ExternalLinkDisclaimer"
import Link from "next/link"
import { powerOutageLinks } from "@/lib/live-utilities"

export default function PowerOutagesPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Live Utilities</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Power Outages</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Current BC Hydro outage map, outage list, reporting information and outage preparedness links for Haida Gwaii readers.
        </p>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h2 className="text-2xl font-black">Report an outage</h2>
        <p className="mt-3 text-sm leading-7">
          If an outage is not shown on BC Hydro’s map, report it by calling 1-800-BCHYDRO / 1-800-224-9376, or *HYDRO / *49376 from a mobile phone.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {powerOutageLinks.map((link) => (
          <a key={link.title} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer" : undefined} className="rounded-3xl border bg-white p-6 shadow-sm hover:border-hgnBlue">
            <h2 className="text-2xl font-black">{link.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{link.description}</p>
          </a>
        ))}
      </section>

      <Link href="/explore/live" className="inline-flex text-sm font-bold text-hgnBlue">← Back to Live Utilities</Link>
              <ExternalLinkDisclaimer />
        </main>
  )
}
