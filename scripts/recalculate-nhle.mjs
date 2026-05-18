import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const nhleFactors = {
  NHL: 1.0,
  AHL: 0.47,
  NCAA: 0.4,
  SHL: 0.78,
  LIIGA: 0.54,
  "FINLAND U-20": 0.12,
  WHL: 0.3,
  OHL: 0.3,
  QMJHL: 0.28,
  USHL: 0.27,
  BCHL: 0.14,
  AJHL: 0.12,
  MHL: 0.2,
  KHL: 0.74,
};

function normalizeLeague(league) {
  return String(league || "")
    .trim()
    .toUpperCase();
}

function getFactor(league) {
  const key = normalizeLeague(league);
  return nhleFactors[key] || 0.25;
}

async function main() {
  console.log("Recalculating NHLe...");

  const { data: rows, error } = await supabase
    .from("player_stats")
    .select("id, games_played, points, league");

  if (error) throw new Error(error.message);

  for (const row of rows || []) {
    const gp = Number(row.games_played || 0);
    const pts = Number(row.points || 0);

    if (!gp || gp <= 0) {
      console.log(`Skipping ${row.id}: missing GP`);
      continue;
    }

    const ppg = pts / gp;
    const factor = getFactor(row.league);
    const nhle = ppg * 82 * factor;

    const { error: updateError } = await supabase
      .from("player_stats")
      .update({
        points_per_game: Number(ppg.toFixed(3)),
        nhle_factor: factor,
        nhle_points: Number(nhle.toFixed(1)),
      })
      .eq("id", row.id);

    if (updateError) {
      console.error(`Failed ${row.id}:`, updateError.message);
    } else {
      console.log(
        `Updated ${row.id}: PPG ${ppg.toFixed(3)}, NHLe ${nhle.toFixed(1)}`
      );
    }
  }

  console.log("NHLe recalculation finished.");
}

main().catch((error) => {
  console.error("NHLe failed:", error.message);
});