import fs from "fs";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const csv = fs.readFileSync("imports/player-stats.csv", "utf8");

const rows = parse(csv, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

async function main() {
  console.log(`Importing ${rows.length} stat rows...`);

  for (const row of rows) {
    const { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("slug", row.slug)
      .single();

    if (!player) {
      console.log(`Missing player: ${row.slug}`);
      continue;
    }

const { error } = await supabase.from("player_stats").upsert({      player_id: player.id,
      season: row.season,
      team: row.team || null,
      league: row.league || null,
      games_played: row.games_played || null,
      goals: row.goals || null,
      assists: row.assists || null,
      points: row.points || null,
      pim: row.pim || null,
      plus_minus: row.plus_minus || null,
      source: row.source || null,
    }, {
  onConflict: "player_id,season,source",
});

    if (error) {
      console.error(`Failed for ${row.slug}:`, error.message);
    } else {
      console.log(`Imported stats for ${row.slug}`);
    }
  }

  console.log("Stats import finished.");
}

main();