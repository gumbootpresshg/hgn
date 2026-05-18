import Link from "next/link"
import AdminGate from "@/components/AdminGate"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <div className="border-b bg-white/90 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 text-sm font-bold">
          <Link href="/admin" className="rounded-full bg-slate-950 px-4 py-2 text-white">Back to Admin</Link>
          <Link href="/" className="rounded-full border px-4 py-2 text-slate-700">View site</Link>
        </div>
      </div>
      {children}
    </AdminGate>
  )
}
