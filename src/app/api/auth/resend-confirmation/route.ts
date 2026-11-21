import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { escapeHtml, serviceClient } from "@/lib/newsletters/server"

export const runtime = "nodejs"

function validEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value)
}

async function sendConfirmation(email: string, name: string, actionLink: string) {
  const apiKey = process.env.RESEND_API_KEY
  // Auth mail must use the verified public HGN sender, not the internal
  // submission-alert sender (which may be the Resend onboarding address).
  const from = process.env.HGN_AUTH_EMAIL_FROM || "Haida Gwaii News <noreply@haidagwaiinews.com>"
  if (!apiKey) return false

  const displayName = name || "there"
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Confirm your Haida Gwaii News account",
        text: `Hi ${displayName},\n\nConfirm your email and sign in to your Haida Gwaii News account:\n${actionLink}\n\nThis link is for you only. If you did not create this account, you can ignore this email.`,
        html: `<!doctype html><html><body style="margin:0;background:#f4f0e8;color:#10243b;font-family:Arial,sans-serif"><div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #d8d2c8;padding:32px"><h1 style="margin:0;font:700 32px Georgia,serif">Haida Gwaii News</h1><p style="font-size:17px;line-height:1.55">Hi ${escapeHtml(displayName)},</p><p style="font-size:17px;line-height:1.55">Confirm your email to finish setting up your HGN account.</p><p style="margin:28px 0"><a href="${escapeHtml(actionLink)}" style="display:inline-block;background:#10243b;color:#fff;padding:13px 18px;font-weight:bold;text-decoration:none">Confirm email and sign in</a></p><p style="font-size:13px;line-height:1.5;color:#666">If you did not create this account, you can ignore this email.</p></div></body></html>`,
      }),
      cache: "no-store",
    })
    return response.ok
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = String(body.email || "").trim().toLowerCase()
    const password = String(body.password || "")
    if (!validEmail(email) || password.length < 8) return NextResponse.json({ sent: false }, { status: 400 })

    // Only resend after proving possession of the account password. This prevents
    // the endpoint from being used to send unwanted mail to arbitrary addresses.
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) return NextResponse.json({ sent: false }, { status: 503 })
    const publicAuth = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })
    const { error: signInError } = await publicAuth.auth.signInWithPassword({ email, password })
    if (!signInError) return NextResponse.json({ sent: false, confirmed: true })
    if (!/confirm/i.test(String(signInError.message || ""))) return NextResponse.json({ sent: false }, { status: 400 })

    const db = serviceClient()
    const { data: profile } = await db.from("hgn_profiles").select("user_id,display_name,email").ilike("email", email).maybeSingle()
    if (!profile?.user_id) return NextResponse.json({ sent: false }, { status: 404 })
    const { data: authUser } = await db.auth.admin.getUserById(profile.user_id)
    if (!authUser?.user || String(authUser.user.email || "").toLowerCase() !== email) return NextResponse.json({ sent: false }, { status: 404 })

    const site = process.env.NEXT_PUBLIC_SITE_URL || "https://haidagwaiinews.com"
    const { data: link, error: linkError } = await db.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${site.replace(/\/$/, "")}/account` },
    })
    const actionLink = (link as any)?.properties?.action_link
    if (linkError || !actionLink) return NextResponse.json({ sent: false }, { status: 500 })

    const sent = await sendConfirmation(email, String(profile.display_name || authUser.user.user_metadata?.display_name || "").trim(), actionLink)
    return NextResponse.json({ sent })
  } catch {
    return NextResponse.json({ sent: false }, { status: 500 })
  }
}
