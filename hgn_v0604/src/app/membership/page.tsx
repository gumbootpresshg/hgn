import Link from "next/link"

export default function MembershipPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.18em] text-hgnBlue">HGN Accounts</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight">Create a Free HGN Account</h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          Paid memberships are not open yet. For now, a free HGN account lets readers post and manage classifieds, sign up for newsletters, submit events and save stories.
        </p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Sign up free</Link>
      </section>
    </main>
  )
}
