import dotenv from "dotenv"
import { readFile, writeFile } from "node:fs/promises"
import { createClient } from "@supabase/supabase-js"

// This is deliberately separate from the direct legacy importer. It only uses
// public captures of HGN's former URLs when the original WordPress hosting is gone.
dotenv.config({ path: ".env.local" })
dotenv.config()

const dryRun = process.argv.includes("--dry-run")
const limitFlag = process.argv.indexOf("--limit")
const limit = limitFlag >= 0 ? Math.max(1, Number(process.argv[limitFlag + 1]) || 25) : Infinity
const delayFlag = process.argv.indexOf("--delay-ms")
const delayMs = delayFlag >= 0 ? Math.max(0, Number(process.argv[delayFlag + 1]) || 6000) : 6000
const stateFile = "legacy-archive-image-recovery-state.json"
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local.")

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const isLegacy = (value) => /(?:\/wp-content\/uploads\/|https?:\/\/i[0-9]\.wp\.com\/)/i.test(String(value || ""))
const originalUrl = (value) => String(value).replace(/^https?:\/\/i[0-9]\.wp\.com\//i, "https://")
const extension = (contentType, source) => {
  if (/png/i.test(contentType)) return "png"
  if (/webp/i.test(contentType)) return "webp"
  if (/gif/i.test(contentType)) return "gif"
  const match = String(source).match(/\.([a-z0-9]{3,4})(?:[?#]|$)/i)
  return match?.[1]?.toLowerCase() || "jpg"
}
const headers = { "User-Agent": "HaidaGwaiiNews archive image recovery/1.0" }
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchArchive(input, options, label) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(input, options)
    if (response.status !== 429 || attempt === 3) return response
    const retryAfter = Number(response.headers.get("retry-after"))
    const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 15000 * (attempt + 1)
    console.warn(`– ${label}: Archive rate limit; waiting ${Math.round(wait / 1000)} seconds before retrying`)
    await sleep(wait)
  }
}

async function loadState() {
  try {
    const parsed = JSON.parse(await readFile(stateFile, "utf8"))
    return { unavailableSources: Array.isArray(parsed.unavailableSources) ? parsed.unavailableSources : [] }
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return { unavailableSources: [] }
    throw error
  }
}

async function archiveCapture(source) {
  const lookup = new URL("https://web.archive.org/cdx/search/cdx")
  lookup.searchParams.set("url", source)
  lookup.searchParams.set("output", "json")
  lookup.searchParams.set("fl", "timestamp,original,statuscode,mimetype")
  lookup.searchParams.append("filter", "statuscode:200")
  lookup.searchParams.append("filter", "mimetype:image/.*")
  lookup.searchParams.set("collapse", "digest")
  lookup.searchParams.set("limit", "1")

  const response = await fetchArchive(lookup, { headers, signal: AbortSignal.timeout(30000) }, source)
  if (!response.ok) throw new Error(`Archive lookup HTTP ${response.status}`)
  const records = await response.json()
  if (!Array.isArray(records) || records.length < 2 || !Array.isArray(records[1])) return null
  const [timestamp, original, , mimeType] = records[1]
  if (!timestamp || !original || !String(mimeType || "").startsWith("image/")) return null
  return { timestamp, original, archiveUrl: `https://web.archive.org/web/${timestamp}id_/${original}` }
}

let offset = 0
const rows = []
while (true) {
  const { data, error } = await db.from("articles").select("id,slug,image_url,og_image_url").not("image_url", "is", null).range(offset, offset + 499)
  if (error) throw error
  rows.push(...(data || []).filter((article) => isLegacy(article.image_url)))
  if (!data?.length) break
  offset += data.length
}

const state = await loadState()
const knownUnavailable = new Set(state.unavailableSources)
const candidates = rows.filter((article) => !knownUnavailable.has(originalUrl(article.image_url)))
const queue = candidates.slice(0, limit)
const report = { dryRun, found: rows.length, knownUnavailable: knownUnavailable.size, attempted: queue.length, migrated: [], unavailable: [], failed: [] }
console.log(`${dryRun ? "Archive dry run:" : "Archive migration:"} ${queue.length} candidate images. Skipping ${knownUnavailable.size} previously unavailable source${knownUnavailable.size === 1 ? "" : "s"}.`)

for (const article of queue) {
  const source = originalUrl(article.image_url)
  try {
    const capture = await archiveCapture(source)
    if (!capture) {
      report.unavailable.push({ id: article.id, slug: article.slug, source, reason: "No archived image capture found" })
      console.warn(`– ${article.slug || article.id}: no archived image capture`)
      continue
    }

    const response = await fetchArchive(capture.archiveUrl, { redirect: "follow", headers, signal: AbortSignal.timeout(45000) }, article.slug || article.id)
    const type = response.headers.get("content-type") || ""
    if (!response.ok) throw new Error(`Archive image HTTP ${response.status}`)
    if (!type.startsWith("image/")) throw new Error(`Archive returned unexpected content type: ${type || "none"}`)
    const bytes = Buffer.from(await response.arrayBuffer())
    if (!bytes.length || bytes.length > 20 * 1024 * 1024) throw new Error("Archive image is empty or over 20 MB")

    if (dryRun) {
      report.migrated.push({ id: article.id, slug: article.slug, source, archiveUrl: capture.archiveUrl, captureTimestamp: capture.timestamp, bytes: bytes.length, dryRun: true })
      console.log(`✓ ${article.slug || article.id}`)
      continue
    }

    const path = `legacy-archive/${article.id}/${Date.now()}.${extension(type, capture.original)}`
    const uploaded = await db.storage.from("article-images").upload(path, bytes, { contentType: type, upsert: false, cacheControl: "31536000" })
    if (uploaded.error) throw uploaded.error
    const publicUrl = db.storage.from("article-images").getPublicUrl(path).data.publicUrl
    const patch = { image_url: publicUrl }
    if (isLegacy(article.og_image_url)) patch.og_image_url = publicUrl
    const updated = await db.from("articles").update(patch).eq("id", article.id)
    if (updated.error) throw updated.error
    report.migrated.push({ id: article.id, slug: article.slug, source, archiveUrl: capture.archiveUrl, captureTimestamp: capture.timestamp, publicUrl })
    console.log(`✓ ${article.slug || article.id}`)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    report.failed.push({ id: article.id, slug: article.slug, source, reason })
    console.warn(`✗ ${article.slug || article.id}: ${reason}`)
  }
  if (delayMs > 0) await sleep(delayMs)
}

await writeFile("legacy-archive-image-migration-report.json", JSON.stringify(report, null, 2))
if (!dryRun) {
  const unavailableSources = [...new Set([...state.unavailableSources, ...report.unavailable.map((item) => item.source)])]
  await writeFile(stateFile, JSON.stringify({ unavailableSources, updatedAt: new Date().toISOString() }, null, 2))
}
console.log(`Finished. Recoverable: ${report.migrated.length}. Not archived: ${report.unavailable.length}. Failed: ${report.failed.length}. Report: legacy-archive-image-migration-report.json`)
