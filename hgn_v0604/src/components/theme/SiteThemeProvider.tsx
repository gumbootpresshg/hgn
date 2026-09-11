"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { defaultLabels, normalizeThemeConfig, themePresets, type SiteThemeConfig } from "@/lib/site-theme"

const ThemeContext = createContext<SiteThemeConfig>(themePresets["island-newspaper"])

function applyTheme(theme: SiteThemeConfig) {
  const root = document.documentElement
  root.style.setProperty("--paper", theme.paper)
  root.style.setProperty("--paper-muted", theme.paperMuted)
  root.style.setProperty("--ink", theme.ink)
  root.style.setProperty("--muted", theme.muted)
  root.style.setProperty("--rule", theme.rule)
  root.style.setProperty("--accent", theme.accent)
  root.style.setProperty("--navy", theme.secondary)
  root.dataset.theme = theme.preset
  root.dataset.headlineFont = theme.headlineFont
  root.dataset.bodyFont = theme.bodyFont
  root.dataset.density = theme.density
  root.dataset.masthead = theme.mastheadStyle
}

export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<SiteThemeConfig>(() => ({ ...themePresets["island-newspaper"], labels: defaultLabels }))
  useEffect(() => {
    let active = true
    fetch("/api/site-config", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!active || !data?.theme) return
        const next = normalizeThemeConfig(data.theme)
        setTheme(next)
        applyTheme(next)
      })
      .catch(() => {})
    return () => { active = false }
  }, [])
  useEffect(() => { applyTheme(theme) }, [theme])
  const value = useMemo(() => theme, [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useSiteTheme() { return useContext(ThemeContext) }
