import {
  publicLaunchConfidenceChecks,
  publicLaunchConfidenceScore,
} from "@/lib/public-launch-confidence"

export default function PublicLaunchConfidencePage() {
  const score = publicLaunchConfidenceScore()

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          HGN Public Launch
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Public Launch Confidence
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          A bigger launch-focused upgrade centered on trust, polish, reader experience,
          and confidence before sharing HGN publicly.
        </p>

        <div className="mt-6 rounded-2xl bg-slate-950 p-6 text-white">
          <p className="text-sm text-slate-300">Current launch confidence</p>
          <p className="mt-2 text-5xl font-bold">{score}%</p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {publicLaunchConfidenceChecks.map((check) => (
          <article key={check.key} className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold">{check.label}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                {check.status}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {check.detail}
            </p>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {check.category}
            </p>
          </article>
        ))}
      </section>
    </main>
  )
}
