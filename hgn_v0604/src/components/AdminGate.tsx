"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

type AdminGateProps = {
  children?: ReactNode
  title?: string
  eyebrow?: string
  description?: string
}

type AdminState = "checking" | "allowed" | "signed-out" | "denied" | "error"

const ACCESS_TIMEOUT_MS = 12000

function withTimeout<T>(promise: PromiseLike<T>, milliseconds: number) {
  return Promise.race<T>([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error("Publisher access check timed out")), milliseconds)
    }),
  ])
}

export default function AdminGate({ children }: AdminGateProps) {
  const [state, setState] = useState<AdminState>("checking")
  const mountedRef = useRef(true)
  const checkIdRef = useRef(0)

  const verify = useCallback(async (knownUser?: User | null) => {
    const checkId = ++checkIdRef.current
    if (mountedRef.current) setState("checking")

    try {
      let user = knownUser
      if (typeof user === "undefined") {
        const { data, error } = await withTimeout(supabase.auth.getSession(), ACCESS_TIMEOUT_MS)
        if (error) throw error
        user = data.session?.user ?? null
      }

      if (!mountedRef.current || checkId !== checkIdRef.current) return
      if (!user) {
        setState("signed-out")
        return
      }

      const { data: profile, error } = await withTimeout(
        supabase
          .from("hgn_profiles")
          .select("account_type,is_admin,can_access_publisher_tools")
          .eq("user_id", user.id)
          .maybeSingle(),
        ACCESS_TIMEOUT_MS
      )

      if (!mountedRef.current || checkId !== checkIdRef.current) return
      if (error) throw error

      const allowed = Boolean(
        profile?.is_admin ||
        profile?.can_access_publisher_tools ||
        profile?.account_type === "admin" ||
        profile?.account_type === "publisher" ||
        profile?.account_type === "editor"
      )
      setState(allowed ? "allowed" : "denied")
    } catch (error) {
      console.warn("Publisher access check failed", error)
      if (mountedRef.current && checkId === checkIdRef.current) setState("error")
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    void verify()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      // Keep the auth callback synchronous. Supabase auth can hold an internal lock
      // while this callback runs, so database/auth work is deferred to the next task.
      window.setTimeout(() => {
        if (mountedRef.current) void verify(session?.user ?? null)
      }, 0)
    })

    return () => {
      mountedRef.current = false
      checkIdRef.current += 1
      subscription.subscription.unsubscribe()
    }
  }, [verify])

  if (state === "allowed") return <>{children}</>

  return (
    <main className="mx-auto flex min-h-[55vh] max-w-2xl items-center px-4 py-12">
      <section className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-hgnBlue">Publisher access</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          {state === "checking"
            ? "Checking newsroom access…"
            : state === "signed-out"
              ? "Sign in required"
              : state === "error"
                ? "Access check interrupted"
                : "Access restricted"}
        </h1>

        {state === "error" ? (
          <>
            <p className="mt-3 text-slate-600">
              The newsroom session did not answer in time. Your work is safe. Retry the access check without refreshing the whole page.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void verify()}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white"
              >
                Retry access
              </button>
              <Link href="/admin" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-800">Admin home</Link>
            </div>
          </>
        ) : state !== "checking" ? (
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
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) setIsAuthed(Boolean(data.session?.user))
    })
    return () => {
      active = false
    }
  }, [])
  return { isAuthed }
}
