export function cleanArticleText(value: string | null | undefined) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
}

export function smartExcerpt(value: string | null | undefined, maxLength = 180) {
  const text = cleanArticleText(value)
  if (!text || text.length <= maxLength) return text

  const candidate = text.slice(0, maxLength + 1)
  const minimumSentenceLength = Math.floor(maxLength * 0.58)
  const sentenceMatches = [...candidate.matchAll(/[.!?](?=\s|$)/g)]
  const sentenceEnd = sentenceMatches
    .map((match) => (match.index ?? -1) + 1)
    .filter((index) => index >= minimumSentenceLength && index <= maxLength)
    .pop()

  if (sentenceEnd) return candidate.slice(0, sentenceEnd).trim()

  const wordEnd = candidate.lastIndexOf(" ", maxLength)
  const cutAt = wordEnd > Math.floor(maxLength * 0.65) ? wordEnd : maxLength
  return `${candidate.slice(0, cutAt).trim().replace(/[,:;\-–—]+$/, "")}…`
}
