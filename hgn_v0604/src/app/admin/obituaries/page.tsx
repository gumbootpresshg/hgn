import Link from "next/link"

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Obituaries</h1>
        <p className="mt-3 text-slate-600">Manage obituary submissions, print payment status and online obituary months.</p>
      </section>
      <section className="grid gap-3 md:grid-cols-2">
        <Link href="/obituaries" className="rounded-2xl border px-4 py-3 text-sm font-bold hover:border-hgnBlue">View obituaries</Link>
      </section>
    </main>
  )
}
