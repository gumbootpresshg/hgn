export function cleanImportedHtml(value?: string | null) {
  if (!value) return ""

  return value
    .replace(/<\s*\/\s*p\s*>/gi, "\n\n")
    .replace(/<\s*p[^>]*>/gi, "")
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/\s*div\s*>/gi, "\n\n")
    .replace(/<\s*div[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "’")
    .replace(/&lsquo;/gi, "‘")
    .replace(/&rdquo;/gi, "”")
    .replace(/&ldquo;/gi, "“")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
