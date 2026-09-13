import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { normalizeThemeConfig, themePresets, type SiteThemeConfig } from '@/lib/site-theme'
import { defaultSitePlatformConfig, normalizeSitePlatformConfig, type SitePlatformConfig } from '@/lib/site-platform-config'

export type PublicSiteConfig = {
  theme: SiteThemeConfig
  platform: SitePlatformConfig
}

export async function getPublicSiteConfig(): Promise<PublicSiteConfig> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return {
      theme: themePresets['island-newspaper'],
      platform: defaultSitePlatformConfig,
    }
  }

  try {
    const db = createClient(url, key, { auth: { persistSession: false } })
    const [{ data: themeData }, { data: platformData }] = await Promise.all([
      db.from('hgn_site_theme_settings').select('*').eq('singleton_key', 'default').maybeSingle(),
      db.from('hgn_site_platform_settings').select('config,updated_at').eq('singleton_key', 'default').maybeSingle(),
    ])

    const theme = themeData
      ? normalizeThemeConfig({
          preset: themeData.preset,
          accent: themeData.accent,
          secondary: themeData.secondary,
          paper: themeData.paper,
          paperMuted: themeData.paper_muted,
          ink: themeData.ink,
          muted: themeData.muted,
          rule: themeData.rule,
          headlineFont: themeData.headline_font,
          bodyFont: themeData.body_font,
          density: themeData.density,
          mastheadStyle: themeData.masthead_style,
          labels: themeData.labels,
          updatedAt: themeData.updated_at,
        })
      : themePresets['island-newspaper']

    const platform = normalizeSitePlatformConfig(
      platformData?.config ? { ...platformData.config, updatedAt: platformData.updated_at } : null,
    )

    return { theme, platform }
  } catch (error) {
    console.error('[site-config] Failed to load public configuration', error instanceof Error ? error.message : 'Unknown error')
    return {
      theme: themePresets['island-newspaper'],
      platform: defaultSitePlatformConfig,
    }
  }
}
