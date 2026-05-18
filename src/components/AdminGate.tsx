"use client"

import type { ReactNode } from "react"

type AdminGateProps = {
  children?: ReactNode
  title?: string
  eyebrow?: string
  description?: string
}

function AdminGate({ children }: AdminGateProps) {
  return <>{children}</>
}

export default AdminGate
export { AdminGate }

export function useAdminSession() {
  return {
    isAuthed: true,
  }
}