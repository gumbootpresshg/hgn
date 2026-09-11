import Link from "next/link"
import { officialColumnNames, slugify } from "@/lib/article-routing"

export const revalidate = 60

export default function ColumnsPage() {
  const columns = officialColumnNames.map((name) => ({
    name,
    slug: slugify(name),
  }))

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-slate-500">Columns</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Columns</h1>
        <p className="mt-3 text-slate-600">
          Haida Gwaii News columnists and recurring columns.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {columns.map((column) => (
          <Link key={column.slug} href={`/columns/${column.slug}`} className="rounded-2xl border bg-white p-5 shadow-sm hover:border-hgnBlue">
            <h2 className="text-xl font-black">{column.name}</h2>
            <p className="mt-2 text-sm text-slate-600">View this column →</p>
          </Link>
        ))}
      </section>
    </main>
  )
}
