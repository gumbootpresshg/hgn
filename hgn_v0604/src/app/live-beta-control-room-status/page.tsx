import { liveBetaControlRoomItems } from "@/lib/live-beta-control-room"

export default function LiveBetaControlRoomStatusPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Live Beta Control Room Status</h1>
      <p className="text-slate-600">
        The live beta control room keeps the two-person workflow focused once HGN is shared.
      </p>
      <ul className="space-y-3">
        {liveBetaControlRoomItems.map((item) => (
          <li key={item.key} className="rounded-2xl border bg-white p-4">
            <strong>{item.label}</strong>
            <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
