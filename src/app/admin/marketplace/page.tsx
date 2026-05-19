import Link from "next/link"

export default function AdminMarketplacePage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <Link href="/admin" className="text-sm font-semibold text-slate-600">
        ← Back to Admin
      </Link>

      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Marketplace</h1>
        <p className="mt-3 text-slate-600">
          Review, edit, approve, and delete marketplace/classified listings.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/classifieds"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-wide text-white"
          >
            Manage Marketplace Listings
          </Link>

          <Link
            href="/admin/classifieds/settings"
            className="rounded-full border px-5 py-3 text-sm font-black uppercase tracking-wide"
          >
            Marketplace Settings
          </Link>

          <Link
            href="/marketplace"
            className="rounded-full border px-5 py-3 text-sm font-black uppercase tracking-wide"
          >
            View Public Marketplace
          </Link>
        </div>
      </section>
    </main>
  )
}