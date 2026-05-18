export function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
export const categories = ["Local News","Sports","Editorial","Letters","Community","Events","Obituaries","Visitor Info"];
