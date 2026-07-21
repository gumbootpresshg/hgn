import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const [{ data: runs, error: runsError }, { data: players, error: playersError }] = await Promise.all([
    supabase.from("bot_runs").select("bot_name,status,message,created_at,finished_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("players").select("id,name,slug,trend,rank,position,team,league").order("trend", { ascending: false, nullsFirst: false }).limit(5),
  ]);

  return NextResponse.json({
    ok: !runsError && !playersError,
    runs: runs || [],
    trending: players || [],
    errors: [runsError?.message, playersError?.message].filter(Boolean),
    generated_at: new Date().toISOString(),
  });
}
