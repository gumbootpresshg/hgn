export type BetaOperationsCheck = {
  key: string
  label: string
  area: "submissions" | "public_site" | "workflow" | "security"
  status: "ready" | "pending"
  priority: "high" | "normal"
  detail: string
}

export const betaOperationsChecks: BetaOperationsCheck[] = [
  {
    key: "letters-alert",
    label: "Letters alert live test",
    area: "submissions",
    status: "pending",
    priority: "high",
    detail: "Submit one real test Letter to the Editor and confirm the email notification arrives.",
  },
  {
    key: "homepage-reader-ready",
    label: "Homepage reader-ready check",
    area: "public_site",
    status: "pending",
    priority: "high",
    detail: "Check homepage freshness, mobile view, and the Free, Independent, Local. tagline.",
  },
  {
    key: "admin-editor-path",
    label: "Admin/editor daily path",
    area: "workflow",
    status: "ready",
    priority: "normal",
    detail: "Use the simplified daily workflow instead of scattered experimental desks.",
  },
  {
    key: "security-lock",
    label: "Basic security lock",
    area: "security",
    status: "pending",
    priority: "high",
    detail: "Confirm admin-only pages are not available to anonymous visitors.",
  },
]

export function betaOperationsScore() {
  const ready = betaOperationsChecks.filter((check) => check.status === "ready").length
  return Math.round((ready / betaOperationsChecks.length) * 100)
}
