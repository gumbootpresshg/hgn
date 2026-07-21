import { onlineBetaShareGateItems } from "@/lib/online-beta-share-gate"

export default function OnlineBetaShareGateStatusPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Online Beta Share Gate Status</h1>
      <p className="text-slate-600">
        Final checks before sharing HGN with real readers.
      </p>
      <ul className="space-y-3">
        {onlineBetaShareGateItems.map((item) => (
          <li key={item.key} className="rounded-2xl border bg-white p-4">
            <strong>{item.label}</strong>
            <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
