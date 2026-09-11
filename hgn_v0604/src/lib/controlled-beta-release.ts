export type ControlledBetaReleaseCheck = {
  key: string
  label: string
  category: string
  status: "pending" | "ready"
  priority: "high" | "normal"
  detail: string
}

export const controlledBetaReleaseChecks: ControlledBetaReleaseCheck[] = [
  {
    key: "production-build-pass",
    label: "Production build passes",
    category: "deployment",
    status: "pending",
    priority: "high",
    detail: "Run npm install, then npm run build. Fix only blocking build errors.",
  },
  {
    key: "admin-auth-verified",
    label: "Admin auth verified",
    category: "security",
    status: "pending",
    priority: "high",
    detail: "Confirm admin routes require login and service keys are not exposed to the browser.",
  },
  {
    key: "letters-alert-verified",
    label: "Letters alert verified",
    category: "submissions",
    status: "pending",
    priority: "high",
    detail: "Submit one test Letter to the Editor and confirm alert delivery.",
  },
  {
    key: "homepage-mobile-pass",
    label: "Homepage mobile pass",
    category: "mobile",
    status: "pending",
    priority: "high",
    detail: "Check homepage and one article on a phone before sharing beta link.",
  },
  {
    key: "beta-audience-limited",
    label: "Controlled beta audience limited",
    category: "launch",
    status: "ready",
    priority: "normal",
    detail: "Share with a small trusted group first. Do not promote broadly yet.",
  },
  {
    key: "feature-freeze-confirmed",
    label: "Feature freeze confirmed",
    category: "workflow",
    status: "ready",
    priority: "high",
    detail: "Stop major feature waves after this release candidate. Fix bugs only during beta.",
  },
]

export function controlledBetaReleaseScore() {
  const ready = controlledBetaReleaseChecks.filter((check) => check.status === "ready").length
  return Math.round((ready / controlledBetaReleaseChecks.length) * 100)
}
