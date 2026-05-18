import fs from "fs";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!supabaseAnonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const csvPath = process.argv[2] || "imports/live-player-stats-template.csv";

function num(value) {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  const csv = fs.readFileSync(csvPath, "utf8");
  const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
  console.log(`Importing ${rows.length} live stat rows from ${csvPath}...`);

  for (const row of rows) {
    const slug = row.slug || row.player_slug;
    if (!slug) {
      console.log("Skipping row with no slug", row);
      continue;
    }

    const { data: player } = await supabase.from("players").select("id, slug").eq("slug", slug).maybeSingle();
    if (!player) {
      console.log(`Missing player: ${slug}`);
      continue;
    }

    const gp = num(row.games_played);
    const goals = num(row.goals);
    const assists = num(row.assists);
    const points = num(row.points) ?? ((goals ?? 0) + (assists ?? 0));
    const ppg = gp && gp > 0 && points !== null ? Number((points / gp).toFixed(3)) : null;

    const payload = {
      player_id: player.id,
      player_slug: slug,
      season: row.season || "2025-26",
      team: row.team || null,
      league: row.league || null,
      games_played: gp,
      goals,
      assists,
      points,
      pim: num(row.pim),
      plus_minus: num(row.plus_minus),
      shots: num(row.shots),
      wins: num(row.wins),
      losses: num(row.losses),
      ot_losses: num(row.ot_losses),
      saves: num(row.saves),
      goals_against: num(row.goals_against),
      save_percentage: num(row.save_percentage),
      goals_against_average: num(row.goals_against_average),
      points_per_game: ppg,
      source: row.source || "Manual CSV",
      source_url: row.source_url || null,
      source_updated_at: row.source_updated_at || new Date().toISOString(),
    };

    const { error } = await supabase.from("player_stats").upsert(payload, { onConflict: "player_id,season,source" });
    if (error) {
      console.error(`Failed stat import for ${slug}:`, error.message);
      continue;
    }

    const { error: playerError } = await supabase
      .from("players")
      .update({ team: row.team || null, league: row.league || null, last_stats_update: new Date().toISOString() })
      .eq("id", player.id);

    if (playerError) console.error(`Failed player freshness update for ${slug}:`, playerError.message);
    else console.log(`Imported stats for ${slug}`);
  }

  console.log("Live stats import finished. Run: node scripts/recalculate-nhle.mjs");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
