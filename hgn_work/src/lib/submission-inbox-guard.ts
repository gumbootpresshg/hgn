export type SubmissionInboxGuardItem = {
  key: string
  label: string
  status: "ready" | "pending" | "optional"
  severity: "high" | "normal"
  detail: string
}

export const submissionInboxGuardItems: SubmissionInboxGuardItem[] = [
  {
    key: "private-inbox",
    label: "Private letters inbox",
    status: "ready",
    severity: "high",
    detail: "Readers can submit letters, but only admin/editor should be able to view submissions.",
  },
  {
    key: "email-smoke-test",
    label: "Email alert smoke test",
    status: "pending",
    severity: "high",
    detail: "Submit one test letter and confirm the alert reaches the correct email inbox.",
  },
  {
    key: "phone-optional",
    label: "Optional phone alert",
    status: "optional",
    severity: "normal",
    detail: "Keep SMS optional until email alerts are proven reliable.",
  },
  {
    key: "spam-rate-limit",
    label: "Spam and rate-limit check",
    status: "pending",
    severity: "high",
    detail: "Confirm honeypot and throttling are active before exposing the form publicly.",
  },
]

export function submissionInboxGuardScore() {
  const required = submissionInboxGuardItems.filter((item) => item.status !== "optional")
  const ready = required.filter((item) => item.status === "ready").length
  return Math.round((ready / required.length) * 100)
}
