import { communityPulseItems, communityPulseScore } from "@/lib/community-pulse"

export default function CommunityPulsePage() {
  const score = communityPulseScore()

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          HGN Live Beta
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Community Pulse
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Track early community response, story resonance, Letters to the Editor activity,
          and homepage relevance after HGN is shared.
        </p>

        <div className="mt-6 rounded-2xl bg-slate-950 p-6 text-white">
          <p className="text-sm text-slate-300">Pulse readiness</p>
          <p className="mt-2 text-5xl font-bold">{score}%</p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {communityPulseItems.map((item) => (
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
