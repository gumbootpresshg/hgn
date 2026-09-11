import AdminGate from "@/components/AdminGate"
import AdminWorkspaceNav from "@/components/admin/AdminWorkspaceNav"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <AdminWorkspaceNav />
      {children}
    </AdminGate>
  )
}
