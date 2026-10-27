import dotenv from "dotenv"
import { writeFile } from "node:fs/promises"
import { createClient } from "@supabase/supabase-js"

// Removes only dead URLs from the retired WordPress media library. Article text,
// publication data and any current Supabase-hosted image are left untouched.
dotenv.config({ path: ".env.local" })
dotenv.config()

const dryRun = process.argv.includes("--dry-run")
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local.")

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const isLegacy = (value) => /(?:\/wp-content\/uploads\/|https?:\/\/i[0-9]\.wp\.com\/)/i.test(String(value || ""))

let offset = 0
const legacy = []
while (true) {
  const { data, error } = await db.from("articles").select("id,slug,title,image_url,og_image_url").not("image_url", "is", null).range(offset, offset + 499)
  if (error) throw error
  legacy.push(...(data || []).filter((article) => isLegacy(article.image_url)))
  if (!data?.length) break
  offset += data.length
}

const report = { dryRun, found: legacy.length, cleared: [], failed: [] }
console.log(`${dryRun ? "Dry run:" : "Clearing:"} ${legacy.length} retired WordPress image reference${legacy.length === 1 ? "" : "s"}.`)

if (!dryRun) {
  await writeFile("legacy-wordpress-image-backup.json", JSON.stringify({ createdAt: new Date().toISOString(), articles: legacy }, null, 2))
}

for (const article of legacy) {
  try {
    const entry = { id: article.id, slug: article.slug, title: article.title, image_url: article.image_url, og_image_url: article.og_image_url }
    if (!dryRun) {
      const patch = { image_url: null, updated_at: new Date().toISOString() }
      if (isLegacy(article.og_image_url)) patch.og_image_url = null
      const { error } = await db.from("articles").update(patch).eq("id", article.id)
      if (error) throw error
    }
    report.cleared.push(entry)
    console.log(`✓ ${article.slug || article.id}`)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    report.failed.push({ id: article.id, slug: article.slug, reason })
    console.warn(`✗ ${article.slug || article.id}: ${reason}`)
  }
}

await writeFile("legacy-wordpress-image-clear-report.json", JSON.stringify(report, null, 2))
console.log(`Finished. ${dryRun ? "Would clear" : "Cleared"}: ${report.cleared.length}. Failed: ${report.failed.length}. Report: legacy-wordpress-image-clear-report.json`)
