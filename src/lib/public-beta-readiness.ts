export type PublicBetaReadinessCheck = {
  key: string
  label: string
  category: string
  status: "ready" | "pending"
  priority: "high" | "normal"
  detail: string
}

export const publicBetaReadinessChecks: PublicBetaReadinessCheck[] = [
  {
    key: "homepage-confidence",
    label: "Homepage public confidence",
    category: "homepage",
    status: "pending",
    priority: "high",
    detail: "Confirm the homepage feels ready to share publicly.",
  },
  {
    key: "article-mobile",
    label: "Article mobile readability",
    category: "mobile",
    status: "pending",
    priority: "high",
    detail: "Review at least one article on a real phone.",
  },
  {
    key: "letters-alert",
    label: "Letters alert confirmed",
    category: "submissions",
    status: "pending",
    priority: "high",
    detail: "Submit one test Letter to the Editor and confirm the email alert.",
  },
  {
    key: "admin-editor-path",
    label: "Admin/editor launch path",
    category: "workflow",
    status: "ready",
    priority: "normal",
    detail: "Use the simplified launch workflow instead of scattered experimental dashboards.",
  },
]

export function publicBetaReadinessScore() {
  const ready = publicBetaReadinessChecks.filter((check) => check.status === "ready").length
  return Math.round((ready / publicBetaReadinessChecks.length) * 100)
}
