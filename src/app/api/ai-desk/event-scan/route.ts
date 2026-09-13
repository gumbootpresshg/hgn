import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { loadDiscoverySettings, normalizeDiscoverySettings, runAutomaticEventDiscovery, saveDiscoverySettings } from "@/lib/server/ai-event-discovery"

export const maxDuration = 60

const allowed = new Set(["admin", "publisher", "editor"])

async function clients(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon || !service) throw new Error("Supabase server settings are incomplete.")
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/, "")
  if (!token) throw new Error("Login required.")
  const auth = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } })
  const { data: { user } } = await auth.auth.getUser(token)
  if (!user) throw new Error("Session could not be verified.")
  const { data: profiles } = await auth.from("hgn_profiles").select("account_type,admin_role,is_admin,can_access_publisher_tools").eq("user_id", user.id)
  if (!(profiles || []).some((x: any) => x.is_admin || x.can_access_publisher_tools || allowed.has(String(x.account_type || "").toLowerCase()) || allowed.has(String(x.admin_role || "").toLowerCase()))) {
    throw new Error("Publisher or editor access required.")
  }
  return { db: createClient(url, service, { auth: { persistSession: false } }), user }
}

export async function GET(req: NextRequest) {
  try {
    const { db } = await clients(req)
    const [{ data, error }, settings] = await Promise.all([
      db.from("hgn_event_sources").select("*").order("last_useful_at", { ascending: false, nullsFirst: false }).order("quality_score", { ascending: false }).limit(150),
      loadDiscoverySettings(db),
    ])
    if (error) throw error
    return NextResponse.json({ sources: data || [], settings })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message.includes("access") ? 403 : 400 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { db, user } = await clients(req)
    const body = await req.json()

    if (body.action === "save_settings") {
      const settings = await saveDiscoverySettings(db, normalizeDiscoverySettings(body.settings || {}), user.id)
      return NextResponse.json({ ok: true, settings })
    }

    if (body.action === "find_events_now" || body.action === "discover_sources") {
      const result = await runAutomaticEventDiscovery(db, { maxQueries: 16, maxWebPages: 20, includeExistingSources: true })
      return NextResponse.json({ ok: true, ...result })
    }

    if (body.action === "review_source") {
      const lifecycle = ["trusted", "watch", "one_time", "ignored"].includes(body.source_lifecycle) ? body.source_lifecycle : "trusted"
      const ignored = lifecycle === "ignored"
      const { error } = await db.from("hgn_event_sources").update({
        source_lifecycle: lifecycle,
        review_status: ignored ? "ignored" : "approved",
        active: !ignored,
        auto_managed: lifecycle === "watch" ? true : false,
        quality_score: ignored ? 0 : Math.min(1, Math.max(0.3, Number(body.quality_score ?? 0.7))),
        max_candidates: Math.min(12, Math.max(3, Number(body.max_candidates ?? 6))),
        updated_at: new Date().toISOString(),
      }).eq("id", body.id)
      if (error) throw error
      return NextResponse.json({ ok: true })
    }

    if (body.action === "add_source") {
      const { data, error } = await db.from("hgn_event_sources").insert({
        name: body.name,
        url: body.url,
        community: body.community || null,
        source_type: body.source_type || "manual",
        quality_score: 0.7,
        max_candidates: 8,
        active: true,
        source_lifecycle: "trusted",
        review_status: "approved",
        auto_managed: false,
      }).select().single()
      if (error) throw error
      return NextResponse.json({ source: data })
    }

    if (body.action === "update_source") {
      const { error } = await db.from("hgn_event_sources").update({
        active: Boolean(body.active),
        quality_score: Math.min(1, Math.max(0, Number(body.quality_score ?? 0.5))),
        max_candidates: Math.min(12, Math.max(3, Number(body.max_candidates ?? 8))),
        updated_at: new Date().toISOString(),
      }).eq("id", body.id)
      if (error) throw error
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Unknown Event Finder action." }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message.includes("access") ? 403 : 400 })
  }
}
