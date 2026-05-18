import { newsroomSimulationChecks } from "@/lib/newsroom-simulation"

export default function NewsroomSimulationStatusPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Newsroom Simulation Status</h1>
      <p className="text-slate-600">
        Stability pass 2: run the site like a real newsroom before deployment.
      </p>
      <ul className="space-y-3">
        {newsroomSimulationChecks.map((check) => (
          <li key={check.key} className="rounded-2xl border bg-white p-4">
            <strong>{check.label}</strong>
            <p className="mt-1 text-sm text-slate-600">{check.detail}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
