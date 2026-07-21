"use client"

import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

type AdminGateProps = {
  children?: ReactNode
  title?: string
  eyebrow?: string
  description?: string
}

type AdminState = "checking" | "allowed" | "signed-out" | "denied"

export default function AdminGate({ children }: AdminGateProps) {
  const [state, setState] = useState<AdminState>("checking")

  useEffect(() => {
    let active = true

    async function verify() {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData.user
      if (!active) return
      if (!user) {
        setState("signed-out")
        return
      }

      const { data: profile, error } = await supabase
        .from("hgn_profiles")
        .select("account_type,is_admin,can_access_publisher_tools")
        .eq("user_id", user.id)
        .maybeSingle()

      if (!active) return
      const allowed = !error && Boolean(
        profile?.is_admin ||
        profile?.can_access_publisher_tools ||
        profile?.account_type === "admin" ||
        profile?.account_type === "publisher"
      )
      setState(allowed ? "allowed" : "denied")
    }

    verify()
    const { data: subscription } = supabase.auth.onAuthStateChange(() => verify())
    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  if (state === "allowed") return <>{children}</>

  return (
    <main className="mx-auto flex min-h-[55vh] max-w-2xl items-center px-4 py-12">
      <section className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">Publisher access</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          {state === "checking" ? "Checking newsroom access…" : state === "signed-out" ? "Sign in required" : "Access restricted"}
        </h1>
        {state !== "checking" ? (
          <>
            <p className="mt-3 text-slate-600">
              {state === "signed-out"
                ? "Use an authorized Haida Gwaii News account to open the newsroom tools."
                : "Your account does not currently have publisher or administrator permission."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {state === "signed-out" ? (
                <Link href="/login?next=/admin" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Sign in</Link>
              ) : null}
              <Link href="/" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-800">Return to site</Link>
            </div>
          </>
        ) : null}
      </section>
    </main>
  )
}

export { AdminGate }

export function useAdminSession() {
  const [isAuthed, setIsAuthed] = useState(false)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsAuthed(Boolean(data.user)))
  }, [])
  return { isAuthed }
}
