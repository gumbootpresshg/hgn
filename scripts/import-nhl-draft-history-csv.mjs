import fs from "fs";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");

const csvPath = process.argv[2] || "imports/nhl-draft-history-template.csv";
const supabase = createClient(supabaseUrl, serviceKey);

function toInt(value, fallback = null) {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNum(value, fallback = null) {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  if (!fs.existsSync(csvPath)) throw new Error(`CSV not found: ${csvPath}`);

  const csv = fs.readFileSync(csvPath, "utf8");
  const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
  console.log(`Found ${rows.length} NHL draft history rows.`);

  const picks = rows.map((row) => ({
    draft_year: toInt(row.draft_year),
    round: toInt(row.round),
    pick_in_round: toInt(row.pick_in_round),
    overall_pick: toInt(row.overall_pick),
    player_name: row.player_name,
    player_slug: row.player_slug || slugify(row.player_name),
    position: row.position || null,
    drafted_by: row.drafted_by || null,
    drafted_by_slug: row.drafted_by_slug || slugify(row.drafted_by),
    amateur_team: row.amateur_team || null,
    amateur_league: row.amateur_league || null,
    nationality: row.nationality || null,
    birth_date: row.birth_date || null,
    height: row.height || null,
    weight: row.weight || null,
    shoots_catches: row.shoots_catches || null,
    nhl_games: toInt(row.nhl_games, 0),
    nhl_goals: toInt(row.nhl_goals, 0),
    nhl_assists: toInt(row.nhl_assists, 0),
    nhl_points: toInt(row.nhl_points, 0),
    goalie_wins: toInt(row.goalie_wins, 0),
    goalie_save_percentage: toNum(row.goalie_save_percentage),
    current_team: row.current_team || null,
    status: row.status || "active",
    puckscope_note: row.puckscope_note || null,
  })).filter((row) => row.draft_year && row.overall_pick && row.player_name);

  const { error } = await supabase
    .from("nhl_draft_picks")
    .upsert(picks, { onConflict: "draft_year,overall_pick" });

  if (error) throw error;
  console.log(`Imported ${picks.length} NHL draft picks.`);

  const years = [...new Set(picks.map((pick) => pick.draft_year))].sort((a, b) => b - a);
  for (const year of years) {
    const yearPicks = picks.filter((pick) => pick.draft_year === year);
    const first = yearPicks.find((pick) => pick.overall_pick === 1);
    if (!first) continue;
    const { error: summaryError } = await supabase.from("nhl_draft_year_summaries").upsert({
      draft_year: year,
      first_overall: first.player_name,
      first_overall_team: first.drafted_by,
      headline: `${year} NHL Draft archive imported`,
      summary: `Imported ${yearPicks.length} picks into the PuckScope draft archive. Add editorial storylines, steals, and re-draft notes from the admin side.`,
    }, { onConflict: "draft_year" });
    if (summaryError) console.warn(`Summary upsert failed for ${year}:`, summaryError.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
