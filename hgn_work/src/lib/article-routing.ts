export function norm(value: unknown) {
  return String(value || "").toLowerCase().trim()
}

export function cleanText(value: unknown) {
  return String(value || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export const officialColumnNames = [
  "Tlellagram",
  "Living Out Loud",
  "Life on the Gwaii",
  "GKNS Chronicles",
  "Off Island Antics",
  "Wisdom Beyond",
  "Island Cuisine",
  "Science Matters",
  "Backseat Life-ing",
  "Book Talk",
  "Gallivanting",
  "Terry's Take",
  "Sandspit Shingle",
  "Masset Matters",
]

export const officialColumnSlugs = officialColumnNames.map(slugify)

export function articleExcerpt(article: any) {
  return article?.excerpt || article?.dek || cleanText(article?.body).slice(0, 180)
}

export function articleAuthor(article: any) {
  return (
    article?.author_name ||
    article?.author ||
    article?.byline ||
    article?.writer ||
    article?.contributor ||
    "Haida Gwaii News"
  )
}

export function articleSectionValues(article: any) {
  return [
    article?.category,
    article?.section,
    article?.vertical,
    article?.type,
    article?.column_name,
    article?.column,
    article?.author_name,
    article?.author,
    article?.byline,
    article?.title,
    article?.slug,
  ].map(norm).filter(Boolean)
}

export function fieldValues(article: any, fields: string[]) {
  return fields.map((field) => norm(article?.[field])).filter(Boolean)
}

export function exactMatch(article: any, terms: string[], fields = ["category", "section", "type", "vertical", "column_name", "column"]) {
  const values = fieldValues(article, fields)
  const cleanTerms = terms.map(norm)
  return values.some((value) => cleanTerms.includes(value) || cleanTerms.includes(slugify(value)))
}

export function containsMatch(article: any, terms: string[], fields = ["category", "section", "type", "vertical", "column_name", "column", "slug"]) {
  const values = fieldValues(article, fields)
  const cleanTerms = terms.map(norm)
  return values.some((value) => cleanTerms.some((term) => value.includes(term)))
}

export function isColumn(article: any) {
  const values = fieldValues(article, ["category", "section", "type", "vertical", "column_name", "column", "slug", "title"])
  return values.some((value) =>
    value.includes("column") ||
    officialColumnSlugs.includes(slugify(value)) ||
    officialColumnNames.map(norm).includes(value)
  )
}

export function isEditorial(article: any) {
  return containsMatch(article, ["editorial"], ["category", "section", "type", "vertical", "slug"])
}

export function isLetter(article: any) {
  return containsMatch(article, ["letter", "letters to the editor"], ["category", "section", "type", "vertical", "slug"])
}

export function isSports(article: any) {
  return exactMatch(article, ["sports", "sport"], ["category", "section", "type", "vertical"])
}

export function isMountieMinute(article: any) {
  return exactMatch(article, ["mountie minute"], ["category", "section", "type", "vertical"]) ||
    containsMatch(article, ["mountie-minute"], ["slug"])
}

export function isLocalNews(article: any) {
  return exactMatch(article, ["local news", "news", "local"], ["category", "section", "type", "vertical"])
    && !isSports(article)
    && !isMountieMinute(article)
    && !isEditorial(article)
    && !isLetter(article)
    && !isColumn(article)
}

export function articleBackHref(article: any) {
  if (isEditorial(article)) return "/opinion/editorials"
  if (isLetter(article)) return "/letters"
  if (isSports(article)) return "/sports"
  if (isMountieMinute(article)) return "/mountie-minute"
  return "/news"
}

export function articleBackLabel(article: any) {
  if (isEditorial(article)) return "Back to Editorials"
  if (isLetter(article)) return "Back to Letters"
  if (isSports(article)) return "Back to Sports"
  if (isMountieMinute(article)) return "Back to Mountie Minute"
  return "Back to News"
}

export function displayAuthor(article: any) {
  return articleAuthor(article)
}
