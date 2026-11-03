import Link from "next/link"
import { nonNewsPageMetadata } from "@/lib/page-metadata"

export const metadata = nonNewsPageMetadata(
  "Contests",
  "Haida Gwaii News community contests, results and ways to take part.",
  "/contests",
)

export default function ContestsPage() {
  return (
    <main className="newspaper-shell py-8 sm:py-12">
      <header className="border-b border-stone-900 pb-7">
        <p className="newspaper-kicker text-hgnRed">Haida Gwaii News</p>
        <h1 className="mt-2 font-serif text-5xl font-bold tracking-tight sm:text-6xl">Contests</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">Island contests, community entries and final results — all in one place.</p>
      </header>

      <section className="mt-8 grid gap-5 sm:grid-cols-2">
        <Link href="/pumpkin-carve-off" className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-hgnRed hover:shadow-md">
          <img src="/pumpkin-carve-off-2026-banner.webp" alt="" className="aspect-[16/9] w-full object-cover" />
          <div className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnRed">2026 results</p>
            <h2 className="mt-2 font-serif text-3xl font-bold group-hover:text-hgnRed">The Great Haida Gwaii Pumpkin Carve-Off</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">See the winner, second and third place, and every pumpkin entered in this year’s contest.</p>
            <span className="mt-5 inline-block text-sm font-bold">View final results →</span>
          </div>
        </Link>
      </section>
    </main>
  )
}
