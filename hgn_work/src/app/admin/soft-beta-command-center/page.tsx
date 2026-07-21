import { softBetaCommandItems } from "@/lib/soft-beta-command-center"

export default function SoftBetaCommandCenterPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          HGN Soft Beta
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Soft Beta Command Center
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Final launch-facing operations view before public beta sharing.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {softBetaCommandItems.map((item) => (
          <article key={item.key} className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold">{item.label}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                {item.status}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {item.detail}
            </p>
          </article>
        ))}
      </section>
    </main>
  )
}
