import Link from "next/link"

export default function RealEstateMovedPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Marketplace</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Real Estate is now in Marketplace</h1>
        <p className="mt-3 text-slate-600">
          Real estate and rentals are now part of the main HGN Marketplace.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/marketplace?category=real-estate" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">
            View Real Estate
          </Link>
          <Link href="/marketplace?category=rentals" className="rounded-full border px-5 py-3 text-sm font-bold">
            View Rentals
          </Link>
        </div>
      </section>
    </main>
  )
}
