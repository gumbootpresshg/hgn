export type ProductionHardeningCheck = {
  key: string
  label: string
  category: string
  status: "pending" | "ready"
  priority: "high" | "normal"
  detail: string
}

export const productionHardeningChecks: ProductionHardeningCheck[] = [
  {
    key: "admin-route-protection",
    label: "Admin route protection",
    category: "security",
    status: "pending",
    priority: "high",
    detail: "Confirm admin routes require login and are not visible to anonymous visitors.",
  },
  {
    key: "supabase-env-check",
    label: "Supabase environment variables",
    category: "deployment",
    status: "pending",
    priority: "high",
    detail: "Confirm production Supabase URL, anon key, and service role usage are safe.",
  },
  {
    key: "submission-form-validation",
    label: "Submission form validation",
    category: "forms",
    status: "pending",
    priority: "high",
    detail: "Confirm Letters to the Editor form handles required fields, spam, and errors cleanly.",
  },
  {
    key: "mobile-overflow-pass",
    label: "Mobile overflow pass",
    category: "mobile",
    status: "pending",
    priority: "high",
    detail: "Check public pages on phones for horizontal scroll, broken cards, and weak spacing.",
  },
  {
    key: "empty-loading-error",
    label: "Empty/loading/error states",
    category: "ux",
    status: "pending",
    priority: "normal",
    detail: "Confirm key public and admin pages do not look broken when data is missing.",
  },
]

export function productionHardeningScore() {
  const ready = productionHardeningChecks.filter((check) => check.status === "ready").length
  return Math.round((ready / productionHardeningChecks.length) * 100)
}
