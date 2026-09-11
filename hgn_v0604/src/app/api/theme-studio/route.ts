import { NextRequest, NextResponse } from "next/server"
import { requirePublisher } from "@/lib/newsletters/server"
import { normalizeThemeConfig } from "@/lib/site-theme"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const [{ data, error }, { data: history }] = await Promise.all([
    auth.db.from("hgn_site_theme_settings").select("*").eq("singleton_key", "default").single(),
    auth.db.from("hgn_site_theme_history").select("id,preset,created_at,created_by,config").order("created_at", { ascending: false }).limit(12),
  ])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data, history: history || [] })
}

export async function POST(req: NextRequest) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json()
  const theme = normalizeThemeConfig(body.theme)
  const publish = Boolean(body.publish)
  const patch = {
    preset: theme.preset,
    accent: theme.accent,
    secondary: theme.secondary,
    paper: theme.paper,
    paper_muted: theme.paperMuted,
    ink: theme.ink,
    muted: theme.muted,
    rule: theme.rule,
    headline_font: theme.headlineFont,
    body_font: theme.bodyFont,
    density: theme.density,
    masthead_style: theme.mastheadStyle,
    labels: theme.labels,
    draft_config: theme,
    is_published: publish,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await auth.db.from("hgn_site_theme_settings").update(patch).eq("singleton_key", "default").select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (publish) {
    await auth.db.from("hgn_site_theme_history").insert({ preset: theme.preset, config: theme, created_by: auth.user.id })
  }
  return NextResponse.json({ settings: data })
}
