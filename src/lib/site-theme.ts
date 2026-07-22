export type ThemePresetId = "island-newspaper" | "coastal-modern" | "weekend-edition" | "high-contrast"

export type SiteLabels = {
  siteName: string
  tagline: string
  news: string
  opinion: string
  weather: string
  community: string
  marketplace: string
  horoscopes: string
  guide: string
  latestStories: string
  events: string
  support: string
  subscribe: string
}

export type SiteThemeConfig = {
  preset: ThemePresetId
  accent: string
  secondary: string
  paper: string
  paperMuted: string
  ink: string
  muted: string
  rule: string
  headlineFont: "serif" | "modern" | "classic"
  bodyFont: "sans" | "serif"
  density: "compact" | "comfortable" | "spacious"
  mastheadStyle: "full" | "compact"
  labels: SiteLabels
  updatedAt?: string
}

export const defaultLabels: SiteLabels = {
  siteName: "Haida Gwaii News",
  tagline: "The Islands' News Source Since 2024",
  news: "News",
  opinion: "Opinion",
  weather: "Weather",
  community: "Community",
  marketplace: "Marketplace",
  horoscopes: "Horoscopes",
  guide: "Haida Gwaii Guide",
  latestStories: "Latest Stories",
  events: "Events",
  support: "Support HGN",
  subscribe: "Subscribe",
}

export const themePresets: Record<ThemePresetId, SiteThemeConfig> = {
  "island-newspaper": {
    preset: "island-newspaper", accent: "#a31d24", secondary: "#173f5f", paper: "#fffefa", paperMuted: "#f4f0e8", ink: "#171717", muted: "#665f57", rule: "#b7b0a6", headlineFont: "serif", bodyFont: "sans", density: "comfortable", mastheadStyle: "full", labels: defaultLabels,
  },
  "coastal-modern": {
    preset: "coastal-modern", accent: "#0f5f78", secondary: "#17465a", paper: "#ffffff", paperMuted: "#edf4f6", ink: "#142126", muted: "#596a70", rule: "#b7c9cf", headlineFont: "modern", bodyFont: "sans", density: "comfortable", mastheadStyle: "compact", labels: defaultLabels,
  },
  "weekend-edition": {
    preset: "weekend-edition", accent: "#8a4b2d", secondary: "#35594a", paper: "#fffaf1", paperMuted: "#f3eadc", ink: "#272018", muted: "#6d6255", rule: "#c8b9a5", headlineFont: "classic", bodyFont: "serif", density: "spacious", mastheadStyle: "full", labels: defaultLabels,
  },
  "high-contrast": {
    preset: "high-contrast", accent: "#005fcc", secondary: "#111111", paper: "#ffffff", paperMuted: "#f1f1f1", ink: "#000000", muted: "#333333", rule: "#666666", headlineFont: "serif", bodyFont: "sans", density: "comfortable", mastheadStyle: "compact", labels: defaultLabels,
  },
}

export function normalizeThemeConfig(value: Partial<SiteThemeConfig> | null | undefined): SiteThemeConfig {
  const preset = value?.preset && value.preset in themePresets ? value.preset : "island-newspaper"
  const base = themePresets[preset]
  return {
    ...base,
    ...value,
    labels: { ...defaultLabels, ...(value?.labels || {}) },
    preset,
  }
}
