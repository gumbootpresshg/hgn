import { alertReliabilityChecks, alertReliabilityScore } from "@/lib/alert-reliability"

export default function AlertReliabilityPage() {
  const score = alertReliabilityScore()

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          HGN Security
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Alert Reliability
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          A small control page for making sure Letters to the Editor alerts are
          reliable before the site goes online. Built for the admin/editor beta workflow.
        </p>
        <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-sm text-slate-300">Readiness score</p>
          <p className="mt-1 text-4xl font-bold">{score}%</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {alertReliabilityChecks.map((check) => (
          <article key={check.key} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold">{check.label}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                {check.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{check.detail}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
