export type NewsroomSimulationCheck = {
  key: string
  label: string
  category: string
  status: "pending" | "ready"
  priority: "high" | "normal"
  detail: string
}

export const newsroomSimulationChecks: NewsroomSimulationCheck[] = [
  {
    key: "publish-story-end-to-end",
    label: "Publish one story end-to-end",
    category: "publishing",
    status: "pending",
    priority: "high",
    detail: "Create or edit a real story, add image/credit/alt text, publish it, and place it on the homepage.",
  },
  {
    key: "homepage-rotation-test",
    label: "Homepage rotation test",
    category: "homepage",
    status: "pending",
    priority: "high",
    detail: "Move the lead story, adjust ordering, and confirm desktop/mobile homepage still feels right.",
  },
  {
    key: "letter-submission-test",
    label: "Letter submission test",
    category: "submissions",
    status: "pending",
    priority: "high",
    detail: "Submit one test Letter to the Editor, confirm it stays private, and confirm alert delivery.",
  },
  {
    key: "mobile-only-session",
    label: "Mobile-only review session",
    category: "mobile",
    status: "pending",
    priority: "high",
    detail: "Use only a phone for at least one review session and log anything awkward or broken.",
  },
  {
    key: "live-update-drill",
    label: "Live update drill",
    category: "live",
    status: "pending",
    priority: "normal",
    detail: "Run a quick breaking/update workflow drill without publishing anything embarrassing.",
  },
]

export function newsroomSimulationScore() {
  const ready = newsroomSimulationChecks.filter((check) => check.status === "ready").length
  return Math.round((ready / newsroomSimulationChecks.length) * 100)
}
