import { slugify } from "@/lib/article-routing"

export const hgnColumnOptions = [
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

export function columnSlugFor(name: string) {
  return slugify(name)
}
