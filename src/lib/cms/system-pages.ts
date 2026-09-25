export const systemPageRoutes: Record<string, string> = {
  about: "/about",
  privacy: "/privacy",
  terms: "/terms",
  support: "/support",
  contact: "/contact",
  advertise: "/advertise",
  community_standards: "/community-standards",
  corrections: "/corrections",
  membership: "/membership",
  subscribe: "/subscribe",
}

export function publicPageRoute(systemKey?: string | null, slug?: string | null) {
  if (systemKey && systemPageRoutes[systemKey]) return systemPageRoutes[systemKey]
  return slug ? `/pages/${slug}` : ""
}

export function isSystemPage(systemKey?: string | null) {
  return Boolean(systemKey && systemPageRoutes[systemKey])
}
