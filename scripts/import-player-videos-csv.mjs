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
const csvPath = process.argv[2] || "imports/player-videos-template.csv";

async function main() {
  const csv = fs.readFileSync(csvPath, "utf8");
  const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
  console.log(`Importing ${rows.length} player videos...`);

  for (const row of rows) {
    const slug = row.player_slug || row.slug || null;
    const { data: player } = slug ? await supabase.from("players").select("id, name").eq("slug", slug).maybeSingle() : { data: null };
    const payload = {
      player_id: player?.id || null,
      player_slug: slug,
      player_name: row.player_name || player?.name,
      title: row.title,
      url: row.url,
      video_type: row.video_type || "Highlight",
      submitted_by: row.submitted_by || null,
      status: row.status || "pending",
      notes: row.notes || null,
      updated_at: new Date().toISOString(),
    };
    if (!payload.player_name || !payload.title || !payload.url) {
      console.log("Skipping incomplete video row", row);
      continue;
    }
    const { error } = await supabase.from("player_videos").insert(payload);
    if (error) console.error(`Failed video import for ${payload.player_name}:`, error.message);
    else console.log(`Imported video: ${payload.player_name} - ${payload.title}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
