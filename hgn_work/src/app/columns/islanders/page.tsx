import Link from "next/link"

export default function ColumnPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-slate-500">Columns</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Islanders</h1>
        <p className="mt-3 text-slate-600">Articles for this column will appear here.</p>
        <Link href="/columns" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">
          Back to columns
        </Link>
      </section>
    </main>
  )
}
