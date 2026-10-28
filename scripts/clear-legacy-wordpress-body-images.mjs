import dotenv from "dotenv"
import { writeFile } from "node:fs/promises"
import { createClient } from "@supabase/supabase-js"

dotenv.config({ path: ".env.local" })
dotenv.config()

const dryRun = process.argv.includes("--dry-run")
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local.")

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const legacyImage = /<img\b(?=[^>]*(?:\/wp-content\/uploads\/|https?:\/\/i[0-9]\.wp\.com\/))[^>]*>/gi
const legacyMarkdownImage = /!\[[^\]]*\]\((?:https?:\/\/)?(?:[^/]+\/wp-content\/uploads\/|i[0-9]\.wp\.com\/)[^)]*\)/gi
const containsLegacy = (value) => /(?:\/wp-content\/uploads\/|https?:\/\/i[0-9]\.wp\.com\/)/i.test(String(value || ""))
// Legacy cleanup can leave a figcaption behind after its image is removed.
// A figure without an image has no reader-facing purpose, whether or not it
// contains whitespace, a caption or an empty link.
const figureWithoutImage = /<figure\b[^>]*>[\s\S]*?<\/figure>/gi
const hasEmptyFigure = (value) => [...String(value || "").matchAll(figureWithoutImage)].some(([figure]) => !/<img\b/i.test(figure))
const clean = (value) => String(value || "")
  .replace(legacyImage, "")
  .replace(legacyMarkdownImage, "")
  .replace(/<a\b[^>]*>\s*<\/a>/gi, "")
  .replace(figureWithoutImage, (figure) => /<img\b/i.test(figure) ? figure : "")

let offset = 0
const articles = []
while (true) {
  const { data, error } = await db.from("articles").select("id,slug,title,body,content").range(offset, offset + 499)
  if (error) throw error
  articles.push(...(data || []).filter((article) => containsLegacy(article.body) || containsLegacy(article.content) || hasEmptyFigure(article.body) || hasEmptyFigure(article.content)))
  if (!data?.length) break
  offset += data.length
}

const report = { dryRun, found: articles.length, cleaned: [], failed: [] }
console.log(`${dryRun ? "Dry run:" : "Clearing:"} ${articles.length} article${articles.length === 1 ? "" : "s"} with retired WordPress images or empty image containers in the body.`)
if (!dryRun) await writeFile("legacy-wordpress-body-image-backup.json", JSON.stringify({ createdAt: new Date().toISOString(), articles }, null, 2))

for (const article of articles) {
  try {
    const body = clean(article.body)
    const content = clean(article.content)
    const entry = { id: article.id, slug: article.slug, title: article.title, bodyImagesRemoved: article.body !== body, contentImagesRemoved: article.content !== content }
    if (!dryRun) {
      const patch = {}
      if (article.body !== body) patch.body = body
      if (article.content !== content) patch.content = content
      const { error } = await db.from("articles").update(patch).eq("id", article.id)
      if (error) throw error
    }
    report.cleaned.push(entry)
    console.log(`✓ ${article.slug || article.id}`)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    report.failed.push({ id: article.id, slug: article.slug, reason })
    console.warn(`✗ ${article.slug || article.id}: ${reason}`)
  }
}

await writeFile("legacy-wordpress-body-image-clear-report.json", JSON.stringify(report, null, 2))
console.log(`Finished. ${dryRun ? "Would clean" : "Cleaned"}: ${report.cleaned.length}. Failed: ${report.failed.length}. Report: legacy-wordpress-body-image-clear-report.json`)
