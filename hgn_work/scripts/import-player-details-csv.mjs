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

const csvPath = "imports/player-details.csv";

async function main() {
  const csv = fs.readFileSync(csvPath, "utf8");

  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Found ${rows.length} player detail rows.`);

  for (const row of rows) {
    const slug = row.slug;

    if (!slug) {
      console.log("Skipping row with no slug:", row);
      continue;
    }

    const updates = {
      team: row.team || null,
      league: row.league || null,
      position: row.position || null,
      height: row.height || null,
      weight: row.weight || null,
      shoots: row.shoots || null,
      stats: row.stats || null,
      note: row.note || null,
      tag: row.tag || null,
    };

    const { error } = await supabase
      .from("players")
      .update(updates)
      .eq("slug", slug);

    if (error) {
      console.error(`Failed updating ${slug}:`, error.message);
    } else {
      console.log(`Updated ${slug}`);
    }
  }

  console.log("Player details import finished.");
}

main();