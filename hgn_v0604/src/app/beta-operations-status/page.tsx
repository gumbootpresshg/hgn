import { betaOperationsChecks } from "@/lib/beta-operations"

export default function BetaOperationsStatusPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Beta Operations Status</h1>
      <p className="text-slate-600">
        A compact status view for online beta readiness.
      </p>
      <ul className="space-y-3">
        {betaOperationsChecks.map((check) => (
          <li key={check.key} className="rounded-2xl border bg-white p-4">
            <strong>{check.label}</strong>
            <p className="mt-1 text-sm text-slate-600">{check.detail}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
