import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.import.local" });
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.import.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const dryRun = process.argv.includes("--dry");
const xmlPath = process.env.WP_XML_PATH || path.join(process.cwd(), "imports", "haidagwaiinews.WordPress.2026-04-28.xml");

function decodeEntities(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function titleCaseName(value = "") {
  const cleaned = decodeEntities(value)
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "Haida Gwaii News";

  return cleaned
    .split(" ")
    .map((part) => {
      if (!part) return part;
      if (part.length <= 2 && part === part.toUpperCase()) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}

function cleanHtml(html = "") {
  return decodeEntities(html)
    .replace(/<!--\s*wp:[\s\S]*?-->/g, "")
    .replace(/<!--\s*\/wp:[\s\S]*?-->/g, "")
    .replace(/<p\s+class=["'][^"']*["']\s*>/gi, "<p>")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripHtml(value = "") {
  return decodeEntities(value).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function slugify(value = "") {
  return stripHtml(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || crypto.randomUUID();
}

function safeDate(value = "") {
  const cleaned = stripHtml(value);
  if (!cleaned || cleaned.startsWith("0000-00-00")) return null;
  const d = new Date(cleaned);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function tag(block, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cdata = new RegExp(`<${escaped}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${escaped}>`, "i");
  const plain = new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, "i");
  return decodeEntities((block.match(cdata)?.[1] ?? block.match(plain)?.[1] ?? "").trim());
}

function blocks(xml, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return xml.match(new RegExp(`<${escaped}[\\s\\S]*?<\\/${escaped}>`, "gi")) || [];
}

function getCategories(itemBlock) {
  const matches = itemBlock.match(/<category\b[^>]*>[\s\S]*?<\/category>/gi) || [];
  const names = [];

  for (const m of matches) {
    const domain = m.match(/domain=["']([^"']+)["']/i)?.[1] || "";
    if (domain && domain !== "category") continue;
    const value = stripHtml(tag(m, "category") || m.replace(/<[^>]+>/g, ""));
    if (value && !names.includes(value)) names.push(value);
  }

  return names;
}

function getFeaturedImage(itemBlock, attachmentMap) {
  const thumbId = tag(itemBlock, "wp:postmeta") && (() => {
    const metas = blocks(itemBlock, "wp:postmeta");
    for (const meta of metas) {
      if (tag(meta, "wp:meta_key") === "_thumbnail_id") return tag(meta, "wp:meta_value");
    }
    return "";
  })();

  if (thumbId && attachmentMap.get(thumbId)) return attachmentMap.get(thumbId);

  const firstImg = itemBlock.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
  return firstImg ? decodeEntities(firstImg) : null;
}

console.log(`Reading ${xmlPath}...`);
const xml = fs.readFileSync(xmlPath, "utf8");

const authorMap = new Map();
for (const authorBlock of blocks(xml, "wp:author")) {
  const login = tag(authorBlock, "wp:author_login");
  const display = tag(authorBlock, "wp:author_display_name");
  const first = tag(authorBlock, "wp:author_first_name");
  const last = tag(authorBlock, "wp:author_last_name");
  const full = [first, last].map(stripHtml).filter(Boolean).join(" ") || display || login;
  if (login) authorMap.set(login, titleCaseName(full));
}

const attachmentMap = new Map();
for (const item of blocks(xml, "item")) {
  if (tag(item, "wp:post_type") !== "attachment") continue;
  const id = tag(item, "wp:post_id");
  const url = tag(item, "wp:attachment_url") || tag(item, "guid");
  if (id && url) attachmentMap.set(id, url);
}

const items = blocks(xml, "item");
const posts = items.filter((item) => tag(item, "wp:post_type") === "post" && tag(item, "wp:status") !== "trash");
console.log(`Found ${posts.length} WordPress posts and ${attachmentMap.size} media attachments.`);

let imported = 0;
let failed = 0;

for (const item of posts) {
  try {
    const title = stripHtml(tag(item, "title")) || "Untitled";
    const slug = stripHtml(tag(item, "wp:post_name")) || slugify(title);
    const body = cleanHtml(tag(item, "content:encoded"));
    const excerpt = cleanHtml(tag(item, "excerpt:encoded")) || stripHtml(body).slice(0, 240);

    const creator = stripHtml(tag(item, "dc:creator"));
    const author_name = authorMap.get(creator) || titleCaseName(creator || "Haida Gwaii News");

    const categories = getCategories(item);
    const category = categories[0] || "News";
    const section = category;
    const image_url = getFeaturedImage(item, attachmentMap);
    const published_at = safeDate(tag(item, "wp:post_date")) || safeDate(tag(item, "pubDate"));

    const payload = {
      title,
      slug,
      body,
      excerpt,
      author_name,
      category,
      section,
      image_url,
      published_at,
      status: "published",
      featured: false,
      front_page_main: false,
    };

    if (dryRun) {
      console.log(`preview: ${title} | ${author_name} | ${category}`);
      imported++;
      continue;
    }

    const { error } = await supabase.from("articles").upsert([payload], { onConflict: "slug" });
    if (error) throw error;
    console.log(`imported: ${title} | ${author_name} | ${category}`);
    imported++;
  } catch (error) {
    failed++;
    console.log(`failed: ${stripHtml(tag(item, "title")) || "Unknown"} — ${error.message}`);
  }
}

console.log(`Done. Imported/updated: ${imported}. Failed: ${failed}.`);
