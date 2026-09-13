import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { runAutomaticEventDiscovery } from "@/lib/server/ai-event-discovery"

export const maxDuration = 60

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return NextResponse.json({ error: "Supabase server settings incomplete." }, { status: 500 })
  try {
    const db = createClient(url, service, { auth: { persistSession: false } })
    const result = await runAutomaticEventDiscovery(db, { maxQueries: 10, maxWebPages: 14, includeExistingSources: true })
    return NextResponse.json({ ok: true, ...result, ran_at: new Date().toISOString() })
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}
