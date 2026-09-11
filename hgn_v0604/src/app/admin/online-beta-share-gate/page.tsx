import {
  onlineBetaShareGateItems,
  onlineBetaShareGateScore,
} from "@/lib/online-beta-share-gate"

export default function OnlineBetaShareGatePage() {
  const score = onlineBetaShareGateScore()

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          HGN Online Beta
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Online Beta Share Gate
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          A final share-readiness board for deciding when HGN is safe to show to
          real readers outside the two-person admin/editor beta.
        </p>

        <div className="mt-6 rounded-2xl bg-slate-950 p-6 text-white">
          <p className="text-sm text-slate-300">Share readiness</p>
          <p className="mt-2 text-5xl font-bold">{score}%</p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {onlineBetaShareGateItems.map((item) => (
          <article key={item.key} className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold">{item.label}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                {item.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {item.category} · {item.priority} priority
            </p>
          </article>
        ))}
      </section>
    </main>
  )
}
