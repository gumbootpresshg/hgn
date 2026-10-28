import dotenv from "dotenv"
import { readFile, writeFile } from "node:fs/promises"
import { createClient } from "@supabase/supabase-js"

// Reverses the unintended timestamp changes made by older legacy-image cleanup
// releases. It uses the local backup lists written before those cleanups.
dotenv.config({ path: ".env.local" })
dotenv.config()

const dryRun = process.argv.includes("--dry-run")
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local.")

const backupFiles = ["legacy-wordpress-image-backup.json", "legacy-wordpress-body-image-backup.json"]
const fullCleanupWindow = process.argv.includes("--full-oct-27-window")
const ids = new Set()
for (const file of backupFiles) {
  try {
    const backup = JSON.parse(await readFile(file, "utf8"))
    for (const article of Array.isArray(backup.articles) ? backup.articles : []) if (article?.id) ids.add(article.id)
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) throw error
  }
}
if (!ids.size && !fullCleanupWindow) throw new Error(`No cleanup backup was found. Keep ${backupFiles.join(" and ")} in C:\\HGN\\HGNSite, or run with --full-oct-27-window to repair every pre-existing story changed by the October 27 cleanup.`)

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const targetIds = [...ids]
const rows = []
if (fullCleanupWindow) {
  const { data, error } = await db.from("articles").select("id,slug,title,published_at,created_at,updated_at")
    .gte("updated_at", "2026-10-27T00:00:00-07:00").lt("updated_at", "2026-10-28T00:00:00-07:00")
    .lt("published_at", "2026-10-27T00:00:00-07:00")
  if (error) throw error
  rows.push(...(data || []))
} else {
  for (let start = 0; start < targetIds.length; start += 100) {
    const { data, error } = await db.from("articles").select("id,slug,title,published_at,created_at,updated_at").in("id", targetIds.slice(start, start + 100))
    if (error) throw error
    rows.push(...(data || []))
  }
}

const report = { dryRun, fullCleanupWindow, backupArticleCount: targetIds.length, found: rows.length, restored: [], skipped: [], failed: [] }
for (const article of rows) {
  const restoreTo = article.published_at || article.created_at
  if (!restoreTo) {
    report.skipped.push({ id: article.id, slug: article.slug, title: article.title, reason: "No publication or creation date" })
    continue
  }
  if (new Date(article.updated_at || 0).getTime() === new Date(restoreTo).getTime()) {
    report.skipped.push({ id: article.id, slug: article.slug, title: article.title, reason: "Already matches publication date" })
    continue
  }
  try {
    if (!dryRun) {
      const { error } = await db.from("articles").update({ updated_at: restoreTo }).eq("id", article.id)
      if (error) throw error
    }
    report.restored.push({ id: article.id, slug: article.slug, title: article.title, from: article.updated_at, to: restoreTo })
    console.log(`✓ ${article.slug || article.id}`)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    report.failed.push({ id: article.id, slug: article.slug, reason })
    console.warn(`✗ ${article.slug || article.id}: ${reason}`)
  }
}

await writeFile("legacy-article-date-restore-report.json", JSON.stringify(report, null, 2))
console.log(`Finished. ${dryRun ? "Would restore" : "Restored"}: ${report.restored.length}. Skipped: ${report.skipped.length}. Failed: ${report.failed.length}. Report: legacy-article-date-restore-report.json`)
