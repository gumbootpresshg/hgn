import Link from "next/link"

export default function AskAnniePausedPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Paused</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Ask Annie is paused for now</h1>
        <p className="mt-3 text-slate-600">
          This section is temporarily hidden while HGN focuses on core news, letters,
          events, classifieds, and beta workflow.
        </p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">
          Back to home
        </Link>
      </section>
    </main>
  )
}
