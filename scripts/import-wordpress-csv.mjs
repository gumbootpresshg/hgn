import fs from "fs";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const path = "imports/wordpress.csv";
if (!fs.existsSync(path)) throw new Error(`Missing ${path}`);
const rows = parse(fs.readFileSync(path,"utf8"), { columns:true, skip_empty_lines:true, trim:true });
function slugify(s){ return (s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,90); }
let count=0;
for (const r of rows) {
 const title = r.post_title || r.title || r.Title || "Untitled";
 const slug = r.post_name || r.slug || slugify(title);
 const body = r.post_content || r.content || r.body || "";
 const published = r.post_date || r.date || r.published_at || new Date().toISOString();
 const payload = { title, slug, body, excerpt:r.post_excerpt || r.excerpt || "", category:r.category || r.categories || "Local News", author_name:r.author || r.post_author || "Haida Gwaii News", cover_image_url:r.featured_image || r.image_url || "", status:"published", published_at:new Date(published).toISOString(), imported_from:"wordpress", wordpress_id:r.ID || r.id || null };
 const { error } = await supabase.from("articles").upsert(payload, { onConflict:"slug" });
 if(error) console.error("Failed", title, error.message); else count++;
}
console.log(`Imported/updated ${count} CSV posts.`);
