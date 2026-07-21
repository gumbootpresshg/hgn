import { controlledBetaReleaseChecks } from "@/lib/controlled-beta-release"

export default function ControlledBetaReleaseStatusPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Controlled Beta Release Status</h1>
      <p className="text-slate-600">
        Final release-candidate checks before HGN is deployed for controlled beta testing.
      </p>
      <ul className="space-y-3">
        {controlledBetaReleaseChecks.map((check) => (
          <li key={check.key} className="rounded-2xl border bg-white p-4">
            <strong>{check.label}</strong>
            <p className="mt-1 text-sm text-slate-600">{check.detail}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
