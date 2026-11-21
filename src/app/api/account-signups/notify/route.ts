import { NextRequest, NextResponse } from "next/server"
import { serviceClient } from "@/lib/newsletters/server"
import { recordSignupNotice } from "@/lib/signup-notifications"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const userId = String(body.user_id || "").trim()
    const email = String(body.email || "").trim().toLowerCase()
    if (!userId || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Invalid signup notification." }, { status: 400 })

    const db = serviceClient()
    const { data: authUser, error: authError } = await db.auth.admin.getUserById(userId)
    if (authError || !authUser?.user || String(authUser.user.email || "").toLowerCase() !== email) {
      return NextResponse.json({ error: "Signup could not be verified." }, { status: 403 })
    }

    const profileName = String(body.display_name || authUser.user.user_metadata?.display_name || "").trim()
    const accountType = String(body.account_type || authUser.user.user_metadata?.account_type || "free_individual").trim()
    const result = await recordSignupNotice(db, { kind: "account_signup", userId, email, name: profileName, accountType })
    return NextResponse.json({ ok: true, ...result })
  } catch {
    // A notification failure must not expose service details or block an account.
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
