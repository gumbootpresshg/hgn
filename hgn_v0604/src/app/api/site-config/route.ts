import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { normalizeThemeConfig, themePresets } from "@/lib/site-theme"

export const revalidate = 60

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return NextResponse.json({ theme: themePresets["island-newspaper"] })
  const db = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await db.from("hgn_site_theme_settings").select("*").eq("singleton_key", "default").maybeSingle()
  if (error || !data) return NextResponse.json({ theme: themePresets["island-newspaper"] })
  return NextResponse.json({ theme: normalizeThemeConfig({
    preset: data.preset,
    accent: data.accent,
    secondary: data.secondary,
    paper: data.paper,
    paperMuted: data.paper_muted,
    ink: data.ink,
    muted: data.muted,
    rule: data.rule,
    headlineFont: data.headline_font,
    bodyFont: data.body_font,
    density: data.density,
    mastheadStyle: data.masthead_style,
    labels: data.labels,
    updatedAt: data.updated_at,
  }) })
}
