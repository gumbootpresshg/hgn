import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const [{ data: sources }, { data: recentStats }, { count: poolCount }, { count: videoCount }] = await Promise.all([
    supabase.from("live_stat_sources").select("name, league, status, last_success_at, last_error").order("name"),
    supabase.from("player_stats").select("season, league, source, source_updated_at").order("source_updated_at", { ascending: false, nullsFirst: false }).limit(8),
    supabase.from("prospect_team_pools").select("id", { count: "exact", head: true }),
    supabase.from("player_videos").select("id", { count: "exact", head: true }).eq("status", "approved"),
  ]);

  return NextResponse.json({
    ok: true,
    generated_at: new Date().toISOString(),
    sources: sources || [],
    recent_stats: recentStats || [],
    prospect_pool_rows: poolCount || 0,
    approved_videos: videoCount || 0,
  });
}
