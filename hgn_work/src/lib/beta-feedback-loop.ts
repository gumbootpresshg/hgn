export type BetaFeedbackLoopItem = {
  key: string
  label: string
  category: string
  status: "ready" | "pending"
  priority: "high" | "normal"
  detail: string
}

export const betaFeedbackLoopItems: BetaFeedbackLoopItem[] = [
  {
    key: "first-reader-feedback",
    label: "First reader feedback",
    category: "reader feedback",
    status: "pending",
    priority: "high",
    detail: "Capture the first 3-5 reactions from real readers after sharing the beta link.",
  },
  {
    key: "bug-triage-window",
    label: "Bug triage window",
    category: "bugfix",
    status: "pending",
    priority: "high",
    detail: "Set aside a short window after sharing the beta link to fix obvious issues.",
  },
  {
    key: "submission-alert-watch",
    label: "Submission alert watch",
    category: "submissions",
    status: "pending",
    priority: "high",
    detail: "Watch Letters to the Editor alerts and confirm nothing private is exposed publicly.",
  },
  {
    key: "homepage-after-feedback",
    label: "Homepage after-feedback pass",
    category: "homepage",
    status: "ready",
    priority: "normal",
    detail: "After early feedback, tune the homepage lead, section order, and stale items.",
  },
]

export function betaFeedbackLoopScore() {
  const ready = betaFeedbackLoopItems.filter((item) => item.status === "ready").length
  return Math.round((ready / betaFeedbackLoopItems.length) * 100)
}
