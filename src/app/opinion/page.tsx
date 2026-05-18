import Link from "next/link"

const sections = [
  { title: "Editorials", href: "/opinion/editorials", description: "Editorials and newsroom opinion." },
  { title: "Letters to the Editor", href: "/letters", description: "Published community letters." },
]

export default function OpinionPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Opinion</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Opinion</h1>
        <p className="mt-3 text-slate-600">Editorials and Letters to the Editor.</p>
      </section>
      <section className="grid gap-5 md:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <h2 className="text-xl font-bold">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
            <p className="mt-4 text-sm font-semibold text-slate-950">Open →</p>
          </Link>
        ))}
      </section>
    </main>
  )
}
