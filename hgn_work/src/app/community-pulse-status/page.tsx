import { communityPulseItems } from "@/lib/community-pulse"

export default function CommunityPulseStatusPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Community Pulse Status</h1>
      <p className="text-slate-600">
        Early local reader response and homepage relevance checks.
      </p>
      <ul className="space-y-3">
        {communityPulseItems.map((item) => (
          <li key={item.key} className="rounded-2xl border bg-white p-4">
            <strong>{item.label}</strong>
            <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
