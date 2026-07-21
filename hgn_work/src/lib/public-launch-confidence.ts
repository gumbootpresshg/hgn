export const publicLaunchConfidenceChecks = [
  {
    key: "mobile-story-readability",
    label: "Mobile story readability",
    status: "pending",
    category: "reader experience",
    detail: "Review typography, spacing, and image crops on real phones.",
  },
  {
    key: "homepage-trust",
    label: "Homepage trust signal",
    status: "ready",
    category: "branding",
    detail: "Free, Independent, Local. should appear consistently across public pages.",
  },
  {
    key: "submission-flow",
    label: "Public submission flow",
    status: "pending",
    category: "submissions",
    detail: "Test a real Letter to the Editor submission and confirm alerts work.",
  },
  {
    key: "share-readiness",
    label: "Soft beta share readiness",
    status: "pending",
    category: "launch",
    detail: "Ask if the current homepage is ready to publicly share.",
  },
]

export function publicLaunchConfidenceScore() {
  const ready = publicLaunchConfidenceChecks.filter((check) => check.status === "ready").length
  return Math.round((ready / publicLaunchConfidenceChecks.length) * 100)
}
