export type CommunityPulseItem = {
  key: string
  label: string
  category: string
  status: "ready" | "pending"
  priority: "high" | "normal"
  detail: string
}

export const communityPulseItems: CommunityPulseItem[] = [
  {
    key: "early-reader-reactions",
    label: "Early reader reactions",
    category: "feedback",
    status: "pending",
    priority: "high",
    detail: "Track the first real reader comments, questions, and confusion points.",
  },
  {
    key: "stories-that-resonate",
    label: "Stories that resonate",
    category: "editorial",
    status: "pending",
    priority: "high",
    detail: "Note which stories get clicks, shares, replies, or direct comments.",
  },
  {
    key: "letters-engagement-watch",
    label: "Letters engagement watch",
    category: "submissions",
    status: "pending",
    priority: "high",
    detail: "Watch whether readers use Letters to the Editor after beta sharing.",
  },
  {
    key: "homepage-local-relevance",
    label: "Homepage local relevance",
    category: "homepage",
    status: "ready",
    priority: "normal",
    detail: "Tune homepage order around what feels most useful to local readers.",
  },
]

export function communityPulseScore() {
  const ready = communityPulseItems.filter((item) => item.status === "ready").length
  return Math.round((ready / communityPulseItems.length) * 100)
}
