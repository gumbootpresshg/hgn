import Link from "next/link"

export default function AdminVisitorGuidePage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">HGN Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Visitor Guide</h1>
        <p className="mt-3 text-slate-600">
          Visitor guide tools are being moved into Explore Haida Gwaii. This page keeps the admin route available so the build does not fail.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/explore" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">
            Open Explore
          </Link>
          <Link href="/admin" className="rounded-full border px-5 py-3 text-sm font-bold">
            Back to Admin
          </Link>
        </div>
      </section>
    </main>
  )
}
