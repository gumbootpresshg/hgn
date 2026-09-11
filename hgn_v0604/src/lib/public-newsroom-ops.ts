export type PublicNewsroomOpsItem = {
  key: string
  label: string
  category: string
  status: "ready" | "pending"
  priority: "high" | "normal"
  detail: string
}

export const publicNewsroomOpsItems: PublicNewsroomOpsItem[] = [
  {
    key: "homepage-freshness",
    label: "Homepage freshness discipline",
    category: "homepage",
    status: "pending",
    priority: "high",
    detail: "Check the homepage each publishing session for stale lead stories and weak ordering.",
  },
  {
    key: "letters-moderation",
    label: "Letters moderation flow",
    category: "submissions",
    status: "pending",
    priority: "high",
    detail: "Review Letters to the Editor privately before any public use.",
  },
  {
    key: "daily-publish-rhythm",
    label: "Daily publish rhythm",
    category: "publishing",
    status: "ready",
    priority: "normal",
    detail: "Use one simple rhythm: plan, publish, homepage check, wrap.",
  },
  {
    key: "live-update-coordination",
    label: "Live update coordination",
    category: "live",
    status: "pending",
    priority: "normal",
    detail: "Use live update flow only for urgent or developing stories.",
  },
]

export function publicNewsroomOpsScore() {
  const ready = publicNewsroomOpsItems.filter((item) => item.status === "ready").length
  return Math.round((ready / publicNewsroomOpsItems.length) * 100)
}
