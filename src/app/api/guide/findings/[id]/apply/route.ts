import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { hasPublisherAccess } from "@/lib/server/publisher-access"
const allowed = new Set(["description", "phone", "address", "hours", "website"])
export const runtime = "nodejs"
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || !service) return NextResponse.json({ error: "Supabase server settings are incomplete." }, { status: 500 })
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/, "")
  const auth = createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } })
  const { data: { user } } = await auth.auth.getUser(token)
  if (!user || !await hasPublisherAccess(auth, user)) return NextResponse.json({ error: "Publisher access required." }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  if (!body.placeId) return NextResponse.json({ error: "Choose the Guide place that this finding updates." }, { status: 400 })
  const admin = createClient(url, service, { auth: { persistSession: false } })
  const { data: finding, error: findingError } = await admin.from("hgn_guide_findings").select("*").eq("id", id).maybeSingle()
  if (findingError || !finding) return NextResponse.json({ error: findingError?.message || "Guide finding not found." }, { status: 404 })
  if (finding.status === "completed") return NextResponse.json({ error: "This finding has already been applied." }, { status: 409 })
  const { data: place, error: placeError } = await admin.from("hgn_guide_places").select("*").eq("id", body.placeId).maybeSingle()
  if (placeError || !place) return NextResponse.json({ error: placeError?.message || "Guide place not found." }, { status: 404 })
  const changes = finding.proposed_changes || {}, patch: Record<string, string> = {}
  for (const [field, value] of Object.entries(changes)) if (allowed.has(field) && typeof value === "string" && value.trim()) patch[field] = value.trim()
  if (!Object.keys(patch).length) return NextResponse.json({ error: "This finding has no safe field changes to apply. Use Guide Manager to complete it manually." }, { status: 400 })
  const now = new Date().toISOString()
  const { error: updateError } = await admin.from("hgn_guide_places").update({ ...patch, source_url: finding.source_url || place.source_url, verified_at: now, last_changed_at: now, updated_at: now }).eq("id", place.id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  const { error: logError } = await admin.from("hgn_guide_change_log").insert({ place_id: place.id, finding_id: finding.id, action: "finding_applied", changed_by: user.id, before_data: Object.fromEntries(Object.keys(patch).map((field) => [field, place[field]])), after_data: patch, note: "Applied after publisher review." })
  if (logError) return NextResponse.json({ error: logError.message }, { status: 500 })
  const { error: completeError } = await admin.from("hgn_guide_findings").update({ status: "completed", reviewed_at: now, reviewed_by: user.id }).eq("id", finding.id)
  if (completeError) return NextResponse.json({ error: completeError.message }, { status: 500 })
  return NextResponse.json({ ok: true, applied: Object.keys(patch) })
}
