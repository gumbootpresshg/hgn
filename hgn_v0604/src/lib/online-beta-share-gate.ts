export type OnlineBetaShareGateItem = {
  key: string
  label: string
  category: string
  status: "ready" | "pending"
  priority: "high" | "normal"
  detail: string
}

export const onlineBetaShareGateItems: OnlineBetaShareGateItem[] = [
  {
    key: "homepage-share-ready",
    label: "Homepage ready to share",
    category: "public site",
    status: "pending",
    priority: "high",
    detail: "Open the homepage on desktop and phone and decide if it is ready to share.",
  },
  {
    key: "first-story-end-to-end",
    label: "First story end-to-end",
    category: "publishing",
    status: "pending",
    priority: "high",
    detail: "Publish or review one real story with image, credit, SEO, and homepage placement.",
  },
  {
    key: "letter-alert-verified",
    label: "Letter alert verified",
    category: "submissions",
    status: "pending",
    priority: "high",
    detail: "Submit one test Letter to the Editor and confirm the alert lands in the right inbox.",
  },
  {
    key: "admin-pages-private",
    label: "Admin pages private",
    category: "security",
    status: "pending",
    priority: "high",
    detail: "Confirm admin pages require login before public beta sharing.",
  },
  {
    key: "rollback-notes-ready",
    label: "Rollback notes ready",
    category: "deployment",
    status: "ready",
    priority: "normal",
    detail: "Keep the previous verified zip and SQL migration notes available before deploying.",
  },
]

export function onlineBetaShareGateScore() {
  const ready = onlineBetaShareGateItems.filter((item) => item.status === "ready").length
  return Math.round((ready / onlineBetaShareGateItems.length) * 100)
}
