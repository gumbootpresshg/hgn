import "server-only"

import { getContactSettings } from "@/lib/contact-settings"
import { notifyHgnOperations } from "@/lib/hgn-operations-notify"

type SignupNotice = {
  kind: "account_signup" | "newsletter_signup"
  email: string
  name?: string | null
  userId?: string | null
  subscriberId?: string | null
  accountType?: string | null
}

function cleanEmail(value: unknown) {
  return String(value || "").trim().toLowerCase()
}

async function sendEmail(destination: string, notice: SignupNotice, inboxId: string) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.HGN_ALERT_EMAIL_FROM || "Haida Gwaii News <onboarding@resend.dev>"
  if (!apiKey || !destination) return false

  const isAccount = notice.kind === "account_signup"
  const name = String(notice.name || "").trim() || "No name provided"
  const subject = isAccount ? "HGN: new reader account" : "HGN: new newsletter signup"
  const text = [
    isAccount ? "A new HGN reader account was created." : "A reader joined the HGN newsletter.",
    "",
    `Name: ${name}`,
    `Email: ${notice.email}`,
    isAccount ? `Account type: ${notice.accountType || "free_individual"}` : "",
    "",
    `Review it in HGN Admin → Submissions: https://haidagwaiinews.com/admin/submissions`,
    `Submission ID: ${inboxId}`,
  ].filter(Boolean).join("\n")

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [destination], reply_to: notice.email, subject, text }),
      cache: "no-store",
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Creates one visible, reviewable item for a genuinely new account or newsletter
 * signup. Failure to notify must never prevent a reader from registering.
 */
export async function recordSignupNotice(db: any, notice: SignupNotice) {
  const email = cleanEmail(notice.email)
  if (!email) return { created: false, reason: "missing_email" }

  const sourceId = notice.userId || notice.subscriberId || email
  const { data: existing } = await db
    .from("submission_inbox")
    .select("id")
    .eq("submission_type", notice.kind)
    .contains("payload", { signup_source_id: sourceId })
    .maybeSingle()
  if (existing?.id) return { created: false, inboxId: String(existing.id), reason: "already_recorded" }

  const isAccount = notice.kind === "account_signup"
  const now = new Date().toISOString()
  const { data, error } = await db
    .from("submission_inbox")
    .insert({
      submission_type: notice.kind,
      title: isAccount ? "New HGN reader account" : "New HGN newsletter signup",
      sender_name: String(notice.name || "").trim() || null,
      sender_email: email,
      message: isAccount
        ? `A new ${notice.accountType || "free_individual"} HGN account was created.`
        : "A reader joined the HGN newsletter.",
      payload: {
        source: notice.kind,
        signup_source_id: sourceId,
        account_user_id: notice.userId || null,
        subscriber_id: notice.subscriberId || null,
        account_type: notice.accountType || null,
      },
      status: "new",
      priority: "normal",
      created_at: now,
      updated_at: now,
    })
    .select("id,created_at")
    .single()

  if (error || !data?.id) return { created: false, reason: error?.message || "inbox_save_failed" }

  const settings = await getContactSettings()
  const destination = process.env.HGN_ALERT_EMAIL_TO || settings.subscriptions_email || settings.contact_email || ""
  const emailSent = await sendEmail(destination, notice, String(data.id))

  if (settings.send_to_operations) {
    try {
      await notifyHgnOperations({
        submissionType: notice.kind,
        sourceId: String(data.id),
        title: isAccount ? "New HGN reader account" : "New HGN newsletter signup",
        submitterName: notice.name || null,
        submitterEmail: email,
        summary: isAccount ? `New ${notice.accountType || "free_individual"} account.` : "New newsletter subscriber.",
        publicAdminUrl: "https://haidagwaiinews.com/admin/submissions",
        receivedAt: data.created_at || now,
        metadata: { account_user_id: notice.userId || null, subscriber_id: notice.subscriberId || null },
      })
    } catch {
      // The in-site submission record remains the source of truth.
    }
  }

  return { created: true, inboxId: String(data.id), emailSent }
}
