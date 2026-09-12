import { NextRequest, NextResponse } from "next/server"
import { requirePublisher } from "@/lib/newsletters/server"
import { normalizeSitePlatformConfig } from "@/lib/site-platform-config"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { data, error } = await auth.db.from("hgn_site_platform_settings").select("*").eq("singleton_key", "default").maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ config: normalizeSitePlatformConfig(data?.config || null) })
}

export async function PUT(req: NextRequest) {
  const auth = await requirePublisher(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json()
  const config = normalizeSitePlatformConfig(body.config)
  const patch = { singleton_key: "default", config, updated_at: new Date().toISOString(), updated_by: auth.user.id }
  const { data, error } = await auth.db.from("hgn_site_platform_settings").upsert(patch, { onConflict: "singleton_key" }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ config: normalizeSitePlatformConfig(data.config) })
}
