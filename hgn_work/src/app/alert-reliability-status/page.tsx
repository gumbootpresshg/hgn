import { alertReliabilityChecks } from "@/lib/alert-reliability"

export default function AlertReliabilityStatusPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Alert Reliability Status</h1>
      <p className="text-slate-600">
        Letters to the Editor alerts are being hardened for the two-person admin/editor beta.
      </p>
      <ul className="space-y-3">
        {alertReliabilityChecks.map((check) => (
          <li key={check.key} className="rounded-2xl border bg-white p-4">
            <strong>{check.label}</strong>
            <p className="mt-1 text-sm text-slate-600">{check.detail}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
