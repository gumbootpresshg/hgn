import Link from "next/link"

export default function SubmitGuestOpinionPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">Opinion</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Submit a Guest Opinion</h1>
        <p className="mt-3 text-slate-600">
          Send a guest opinion or commentary submission to Haida Gwaii News.
        </p>
        <Link href="/contact" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">
          Contact the newsroom
        </Link>
      </section>
    </main>
  )
}
