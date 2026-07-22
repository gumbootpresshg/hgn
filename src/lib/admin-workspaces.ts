export type AdminRole = "publisher" | "editor" | "sales" | "shared"

export type AdminTool = {
  href: string
  label: string
  description: string
  group: string
  roles: AdminRole[]
  keywords: string[]
  priority?: boolean
  mobileRelevant?: boolean
}

export const adminTools: AdminTool[] = [
  { href: "/admin/front-page", label: "Front Page", description: "Choose the lead story, homepage photo and front-page order.", group: "Newsroom", roles: ["publisher", "editor"], keywords: ["homepage", "lead", "featured"], priority: true, mobileRelevant: true },
  { href: "/admin/articles", label: "Articles", description: "Write, edit, schedule and publish stories.", group: "Newsroom", roles: ["publisher", "editor"], keywords: ["stories", "news", "publish"], priority: true, mobileRelevant: true },
  { href: "/admin/ai-desk", label: "AI Desk", description: "Prepare sourced drafts and research for human review.", group: "Newsroom", roles: ["publisher", "editor"], keywords: ["agents", "research", "draft"], mobileRelevant: false },
  { href: "/admin/events", label: "Events", description: "Review, edit and publish community events.", group: "Community", roles: ["publisher", "editor"], keywords: ["calendar", "community", "coming up"], priority: true, mobileRelevant: true },
  { href: "/admin/submissions", label: "Submissions", description: "Review incoming letters, tips, notices and community material.", group: "Community", roles: ["publisher", "editor"], keywords: ["inbox", "letters", "tips"], priority: true, mobileRelevant: true },
  { href: "/admin/obituaries", label: "Obituaries", description: "Review and publish obituary notices.", group: "Community", roles: ["publisher", "editor"], keywords: ["notices", "memorial"], mobileRelevant: true },
  { href: "/admin/island-lens", label: "Island Lens", description: "Manage reader photos and photo features.", group: "Community", roles: ["publisher", "editor"], keywords: ["photos", "gallery"], mobileRelevant: true },
  { href: "/admin/horoscope", label: "Horoscopes", description: "Prepare and publish horoscope content.", group: "Community", roles: ["publisher", "editor"], keywords: ["daily", "zodiac"] },
  { href: "/admin/polls", label: "Polls", description: "Create and manage reader polls.", group: "Community", roles: ["publisher", "editor"], keywords: ["vote", "question"] },

  { href: "/admin/newsletter", label: "Newsletter", description: "Build, preview, test and send the newspaper-style newsletter.", group: "Audience", roles: ["publisher", "editor"], keywords: ["email", "digest", "subscribers"], priority: true, mobileRelevant: true },
  { href: "/admin/subscribers", label: "Newsletter Subscribers", description: "Review newsletter subscriber records.", group: "Audience", roles: ["publisher", "editor"], keywords: ["email", "audience", "preferences"] },
  { href: "/admin/members", label: "Members", description: "Manage reader accounts and access levels.", group: "Audience", roles: ["publisher"], keywords: ["accounts", "users"] },
  { href: "/admin/subscriptions", label: "Print Subscriptions", description: "Manage newspaper subscriptions and account status.", group: "Audience", roles: ["publisher", "sales"], keywords: ["paper", "delivery", "renewal"] },

  { href: "/admin/operations", label: "Revenue Overview", description: "See invoices, outstanding balances, payments and follow-ups.", group: "Revenue", roles: ["publisher", "sales"], keywords: ["money", "dashboard", "advertising"], priority: true },
  { href: "/admin/sales", label: "Sales Desk", description: "Manage prospects, renewals and advertiser follow-ups.", group: "Revenue", roles: ["publisher", "sales"], keywords: ["leads", "advertisers", "follow up"], priority: true },
  { href: "/admin/customers", label: "Customers", description: "Open the clean customer record for each advertiser.", group: "Revenue", roles: ["publisher", "sales"], keywords: ["business", "advertiser", "contact"] },
  { href: "/admin/billing", label: "Billing Queue", description: "Prepare invoices, record payments and track overdue balances.", group: "Revenue", roles: ["publisher", "sales"], keywords: ["invoice", "payment", "overdue"], priority: true },
  { href: "/admin/integrations", label: "Square & Integrations", description: "Sync Square and review connected payment sources.", group: "Revenue", roles: ["publisher", "sales"], keywords: ["square", "paypal", "patreon", "sync"] },
  { href: "/admin/reports", label: "Reports & Exports", description: "Create bookkeeping, tax-support and government-reporting files.", group: "Revenue", roles: ["publisher", "sales"], keywords: ["csv", "tax", "gst", "government", "accountant"], priority: true },
  { href: "/admin/ads", label: "Ad Manager", description: "Manage advertising creative and placements.", group: "Revenue", roles: ["publisher", "sales"], keywords: ["advertising", "placements", "creative"] },
  { href: "/admin/business-directory", label: "Business Directory", description: "Review and maintain business listings.", group: "Revenue", roles: ["publisher", "sales", "editor"], keywords: ["directory", "listing", "business"], mobileRelevant: true },
  { href: "/admin/marketplace", label: "Marketplace", description: "Review listings and marketplace activity.", group: "Revenue", roles: ["publisher", "editor", "sales"], keywords: ["classifieds", "listings"] },

  { href: "/admin/guide-keeper", label: "Guide Keeper", description: "Check official sources and review changes to the island guide.", group: "Island Guide", roles: ["publisher", "editor"], keywords: ["tourism", "sources", "automation"], priority: true, mobileRelevant: true },
  { href: "/admin/visitor-guide", label: "Guide Manager", description: "Review the public visitor guide and its content.", group: "Island Guide", roles: ["publisher", "editor"], keywords: ["tourism", "places", "map"], priority: true, mobileRelevant: true },
  { href: "/explore/map", label: "View Public Map", description: "Open the live visitor map exactly as readers see it.", group: "Island Guide", roles: ["publisher", "editor", "sales"], keywords: ["map", "markers", "near me"], mobileRelevant: true },
  { href: "/explore/directory", label: "View Public Directory", description: "Open the searchable public guide directory.", group: "Island Guide", roles: ["publisher", "editor", "sales"], keywords: ["places", "directory", "tourism"], mobileRelevant: true },

  { href: "/admin/settings", label: "Settings", description: "Open the main site and platform settings.", group: "Platform", roles: ["publisher"], keywords: ["configuration", "site"] },
  { href: "/admin/platform-map", label: "Platform Map", description: "See which important tools are connected and where they live.", group: "Platform", roles: ["publisher", "editor", "sales"], keywords: ["audit", "routes", "connected"], priority: true },
  { href: "/admin/app-readiness", label: "App Readiness", description: "Track what must be stable before the first iOS and Android release.", group: "Platform", roles: ["publisher", "editor", "sales"], keywords: ["ios", "android", "mobile", "api"], priority: true, mobileRelevant: true },
  { href: "/admin/media", label: "Media Library", description: "Manage uploaded photos and reusable media.", group: "Platform", roles: ["publisher", "editor"], keywords: ["images", "photos", "uploads"] },
]

export const adminGroups = ["Newsroom", "Community", "Audience", "Revenue", "Island Guide", "Platform"]

export function normalizeAdminRole(value: unknown): AdminRole {
  const role = String(value || "").toLowerCase()
  if (role.includes("sales")) return "sales"
  if (role.includes("editor")) return "editor"
  return "publisher"
}
