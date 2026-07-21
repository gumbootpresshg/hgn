export type AlertReliabilityCheck = {
  key: string
  label: string
  status: "ready" | "needs_setup" | "optional"
  detail: string
}

export const alertReliabilityChecks: AlertReliabilityCheck[] = [
  {
    key: "letters-email",
    label: "Letters to the Editor email alert",
    status: "needs_setup",
    detail: "Set the destination email in the admin alert settings before online beta.",
  },
  {
    key: "letters-phone",
    label: "Optional phone alert",
    status: "optional",
    detail: "Use SMS only after email alerts are confirmed reliable.",
  },
  {
    key: "submission-privacy",
    label: "Submission privacy",
    status: "ready",
    detail: "Public visitors should be able to submit letters, not read the private inbox.",
  },
  {
    key: "partial-migration-guard",
    label: "Partial migration guard",
    status: "ready",
    detail: "v146 repairs older alert_key and alert_label table requirements before seeding.",
  },
]

export function alertReliabilityScore() {
  const ready = alertReliabilityChecks.filter((check) => check.status === "ready").length
  return Math.round((ready / alertReliabilityChecks.length) * 100)
}
