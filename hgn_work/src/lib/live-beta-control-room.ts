export type LiveBetaControlRoomItem = {
  key: string
  label: string
  category: string
  status: "ready" | "pending"
  priority: "high" | "normal"
  detail: string
}

export const liveBetaControlRoomItems: LiveBetaControlRoomItem[] = [
  {
    key: "homepage-freshness",
    label: "Homepage freshness watch",
    category: "homepage",
    status: "pending",
    priority: "high",
    detail: "Check the homepage lead, latest stories, and stale items during beta.",
  },
  {
    key: "reader-submission-watch",
    label: "Reader submission watch",
    category: "submissions",
    status: "pending",
    priority: "high",
    detail: "Watch Letters to the Editor and other submissions after the beta link is shared.",
  },
  {
    key: "breaking-update-ready",
    label: "Breaking update ready",
    category: "publishing",
    status: "ready",
    priority: "normal",
    detail: "Keep the quick publish/live update path ready during beta.",
  },
  {
    key: "admin-editor-checkin",
    label: "Admin/editor check-in",
    category: "workflow",
    status: "ready",
    priority: "normal",
    detail: "Use one lightweight check-in instead of multiple dashboards during beta.",
  },
]

export function liveBetaControlRoomScore() {
  const ready = liveBetaControlRoomItems.filter((item) => item.status === "ready").length
  return Math.round((ready / liveBetaControlRoomItems.length) * 100)
}
