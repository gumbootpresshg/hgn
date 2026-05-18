import Link from "next/link"

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-black tracking-tight">Vehicles & Boats</h1>
        <p className="mt-3 text-slate-600">Vehicle and boat classifieds will live here.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">
          Back to home
        </Link>
      </section>
    </main>
  )
}
