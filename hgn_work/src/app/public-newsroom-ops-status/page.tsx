import { publicNewsroomOpsItems } from "@/lib/public-newsroom-ops"

export default function PublicNewsroomOpsStatusPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Public Newsroom Ops Status</h1>
      <p className="text-slate-600">
        Lightweight operational checks for running HGN after beta sharing.
      </p>
      <ul className="space-y-3">
        {publicNewsroomOpsItems.map((item) => (
          <li key={item.key} className="rounded-2xl border bg-white p-4">
            <strong>{item.label}</strong>
            <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
