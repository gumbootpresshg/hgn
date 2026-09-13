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
  { href: "/admin/authors", label: "Authors", description: "Manage writer profiles, photos, bios and article bylines.", group: "Newsroom", roles: ["publisher", "editor"], keywords: ["authors", "writers", "reporters", "bylines"], mobileRelevant: true },
  { href: "/admin/columns", label: "Columns", description: "Manage column series and connect them to writers.", group: "Newsroom", roles: ["publisher", "editor"], keywords: ["columnists", "columns", "writers", "opinion"], mobileRelevant: true },
  { href: "/admin/ai-desk", label: "AI Desk", description: "Review story leads, automatically found events and source checks.", group: "Newsroom", roles: ["publisher", "editor"], keywords: ["agents", "research", "draft"] },

  { href: "/admin/inbox", label: "Inbox", description: "Read, reply to, assign and archive reader correspondence.", group: "Incoming", roles: ["publisher", "editor"], keywords: ["contact", "messages", "reply", "email", "inbox"], priority: true, mobileRelevant: true },
  { href: "/admin/submissions", label: "Submissions", description: "See publishable reader submissions and open the correct review workspace.", group: "Incoming", roles: ["publisher", "editor"], keywords: ["letters", "events", "tips", "notices", "obituaries", "photos"], priority: true, mobileRelevant: true },

  { href: "/admin/events", label: "Events", description: "Review, edit and publish community events.", group: "Community", roles: ["publisher", "editor"], keywords: ["calendar", "community", "coming up"], priority: true, mobileRelevant: true },
  { href: "/admin/letters", label: "Letters", description: "Review and publish Letters to the Editor.", group: "Community", roles: ["publisher", "editor"], keywords: ["letters", "opinion", "reader"], mobileRelevant: true },
  { href: "/admin/obituaries", label: "Obituaries", description: "Review and publish obituary notices.", group: "Community", roles: ["publisher", "editor"], keywords: ["notices", "memorial"], mobileRelevant: true },
  { href: "/admin/island-lens", label: "Island Lens", description: "Manage reader photos and photo features.", group: "Community", roles: ["publisher", "editor"], keywords: ["photos", "gallery"], mobileRelevant: true },
  { href: "/admin/polls", label: "Polls", description: "Create and manage reader polls.", group: "Community", roles: ["publisher", "editor"], keywords: ["vote", "question"] },

  { href: "/admin/newsletter", label: "Newsletter", description: "Build, preview, test and send the newspaper-style newsletter.", group: "Audience", roles: ["publisher", "editor"], keywords: ["email", "digest", "subscribers"], priority: true, mobileRelevant: true },
  { href: "/admin/subscribers", label: "Newsletter Subscribers", description: "Review newsletter subscriber records and preferences.", group: "Audience", roles: ["publisher", "editor"], keywords: ["email", "audience", "preferences"] },
  { href: "/admin/members", label: "Members", description: "Manage reader accounts and access levels.", group: "Audience", roles: ["publisher"], keywords: ["accounts", "users"] },

  { href: "/admin/ads", label: "Advertising", description: "Manage public advertising creative and placements.", group: "Local Commerce", roles: ["publisher", "sales"], keywords: ["advertising", "placements", "creative"] },
  { href: "/admin/business-directory", label: "Business Directory", description: "Review and maintain public business listings.", group: "Local Commerce", roles: ["publisher", "sales", "editor"], keywords: ["directory", "listing", "business"], mobileRelevant: true },
  { href: "/admin/marketplace", label: "Marketplace", description: "Review public listings, classifieds and marketplace activity.", group: "Local Commerce", roles: ["publisher", "editor", "sales"], keywords: ["classifieds", "listings", "jobs"] },

  { href: "/admin/guide-keeper", label: "Guide Keeper", description: "Check approved sources and review changes to the island guide.", group: "Island Guide", roles: ["publisher", "editor"], keywords: ["tourism", "sources", "automation"], priority: true, mobileRelevant: true },
  { href: "/admin/visitor-guide", label: "Guide Manager", description: "Review and maintain public visitor-guide content.", group: "Island Guide", roles: ["publisher", "editor"], keywords: ["tourism", "places", "map"], priority: true, mobileRelevant: true },
  { href: "/explore/map", label: "View Public Map", description: "Open the live visitor map exactly as readers see it.", group: "Island Guide", roles: ["publisher", "editor", "sales"], keywords: ["map", "markers", "near me"], mobileRelevant: true },

  { href: "/admin/media", label: "Media", description: "Manage uploaded photos and reusable media.", group: "Platform", roles: ["publisher", "editor"], keywords: ["images", "photos", "uploads"] },
  { href: "/admin/pages", label: "Pages", description: "Build and edit public information pages without code.", group: "Platform", roles: ["publisher", "editor"], keywords: ["pages", "about", "legal", "cms", "page builder"], mobileRelevant: true },
  { href: "/admin/footer", label: "Footer", description: "Edit public footer groups, links and visibility.", group: "Platform", roles: ["publisher"], keywords: ["footer", "bottom menu", "links", "legal"] },
  { href: "/admin/archives", label: "Archive Newsstand", description: "Upload and publish print editions to the public newsstand.", group: "Platform", roles: ["publisher", "editor"], keywords: ["archives", "pdf", "edition", "newspaper", "newsstand"], mobileRelevant: true },
  { href: "/admin/site-configuration", label: "Site Configuration", description: "Edit menus, sections, feature switches and visibility without code.", group: "Platform", roles: ["publisher"], keywords: ["navigation", "menus", "sections", "features", "visibility", "configuration"], mobileRelevant: true },
  { href: "/admin/theme-studio", label: "Theme Studio", description: "Change approved themes, colours, typography and public site labels without code.", group: "Platform", roles: ["publisher"], keywords: ["theme", "colors", "colours", "fonts", "labels", "branding"], mobileRelevant: true },
  { href: "/admin/settings", label: "Settings", description: "Open site, publishing and notification settings.", group: "Platform", roles: ["publisher"], keywords: ["configuration", "site", "publishing"] },
  { href: "/admin/app-readiness", label: "App Readiness", description: "Track what must be stable before the first iOS and Android release.", group: "Platform", roles: ["publisher", "editor", "sales"], keywords: ["ios", "android", "mobile", "api"], mobileRelevant: true },
  { href: "/admin/site-health", label: "Site Health", description: "Open security, submission-protection and platform diagnostics in one place.", group: "Platform", roles: ["publisher"], keywords: ["security", "health", "diagnostics", "alerts", "submission shield"] },
  { href: "/admin/legacy-tools", label: "Legacy Tools", description: "Temporary publisher-only access to older admin utilities while they are retired.", group: "Platform", roles: ["publisher"], keywords: ["legacy", "old", "beta", "launch", "deprecated"] },
]

export const adminGroups = ["Newsroom", "Incoming", "Community", "Audience", "Local Commerce", "Island Guide", "Platform"]

export function normalizeAdminRole(value: unknown): AdminRole {
  const role = String(value || "").toLowerCase()
  if (role.includes("sales")) return "sales"
  if (role.includes("editor")) return "editor"
  return "publisher"
}
