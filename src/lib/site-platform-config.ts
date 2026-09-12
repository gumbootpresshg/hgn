export type Visibility = "public" | "logged_in" | "members" | "staff" | "disabled"

export type SiteNavEntry = {
  id: string
  label: string
  href?: string
  enabled: boolean
  visibility: Visibility
  children?: SiteNavEntry[]
}

export type SiteSectionConfig = {
  id: string
  label: string
  route: string
  enabled: boolean
  visibility: Visibility
  includeInApp: boolean
  includeOnHomepage: boolean
}

export type SiteFeatureConfig = Record<string, boolean>

export type SitePlatformConfig = {
  navigation: SiteNavEntry[]
  sections: SiteSectionConfig[]
  features: SiteFeatureConfig
  updatedAt?: string
}

export const defaultNavigation: SiteNavEntry[] = [
  { id: "news", label: "News", enabled: true, visibility: "public", children: [
    { id: "latest", label: "Latest Stories", href: "/articles", enabled: true, visibility: "public" },
    { id: "local", label: "Local News", href: "/news", enabled: true, visibility: "public" },
    { id: "mountie-minute", label: "Mountie Minute", href: "/mountie-minute", enabled: true, visibility: "public" },
    { id: "sports", label: "Sports", href: "/sports", enabled: true, visibility: "public" },
  ]},
  { id: "opinion", label: "Opinion", enabled: true, visibility: "public", children: [
    { id: "editorials", label: "Editorials", href: "/opinion/editorials", enabled: true, visibility: "public" },
    { id: "columns", label: "Columns", href: "/columns", enabled: true, visibility: "public" },
    { id: "letters", label: "Letters to the Editor", href: "/letters", enabled: true, visibility: "public" },
    { id: "guest-opinion", label: "Submit a Guest Opinion", href: "/submit-guest-opinion", enabled: true, visibility: "public" },
  ]},
  { id: "weather", label: "Weather", href: "/weather", enabled: true, visibility: "public" },
  { id: "community", label: "Community", enabled: true, visibility: "public", children: [
    { id: "events", label: "Events", href: "/events", enabled: true, visibility: "public" },
    { id: "obituaries", label: "Obituaries", href: "/obituaries", enabled: true, visibility: "public" },
    { id: "ferry", label: "Ferry Info", href: "/ferry-info", enabled: true, visibility: "public" },
  ]},
  { id: "marketplace", label: "Marketplace", href: "/marketplace", enabled: true, visibility: "public" },
  { id: "horoscopes", label: "Horoscopes", href: "/horoscope", enabled: true, visibility: "public" },
  { id: "guide", label: "Haida Gwaii Guide", enabled: true, visibility: "public", children: [
    { id: "guide-home", label: "Guide Home", href: "/explore", enabled: true, visibility: "public" },
    { id: "guide-map", label: "Island Map", href: "/explore/map", enabled: true, visibility: "public" },
    { id: "guide-travel", label: "Ferries & Travel", href: "/explore/travel", enabled: true, visibility: "public" },
    { id: "guide-cams", label: "Island Cams", href: "/explore/cams", enabled: true, visibility: "public" },
    { id: "guide-directory", label: "Directory", href: "/explore/directory", enabled: true, visibility: "public" },
  ]},
]

export const defaultSections: SiteSectionConfig[] = [
  ["news","News","/news"], ["opinion","Opinion","/opinion"], ["sports","Sports","/sports"], ["events","Events","/events"],
  ["marketplace","Marketplace","/marketplace"], ["guide","Guide","/explore"], ["obituaries","Obituaries","/obituaries"],
  ["island-lens","Island Lens","/island-lens"], ["archives","Archives","/digital-paper"], ["weather","Weather","/weather"],
].map(([id,label,route]) => ({ id, label, route, enabled: true, visibility: "public" as Visibility, includeInApp: true, includeOnHomepage: true }))

export const defaultFeatures: SiteFeatureConfig = {
  marketplace: true, events: true, guide: true, obituaries: true, polls: true, newsletter: true,
  reader_accounts: true, membership: true, weather: true, tides: true, emergency_alerts: true, island_lens: true,
}

export const defaultSitePlatformConfig: SitePlatformConfig = { navigation: defaultNavigation, sections: defaultSections, features: defaultFeatures }

export function normalizeSitePlatformConfig(value: Partial<SitePlatformConfig> | null | undefined): SitePlatformConfig {
  return {
    navigation: Array.isArray(value?.navigation) ? value!.navigation : defaultNavigation,
    sections: Array.isArray(value?.sections) ? value!.sections : defaultSections,
    features: { ...defaultFeatures, ...(value?.features || {}) },
    updatedAt: value?.updatedAt,
  }
}
