import sanitizeHtml from "sanitize-html"

const allowedTags = [
  "p", "br", "strong", "em", "b", "i", "u", "s", "blockquote", "ul", "ol", "li",
  "h2", "h3", "h4", "a", "figure", "figcaption", "img", "hr", "code", "pre", "span"
]

export function sanitizeArticleHtml(value?: string | null) {
  const cleaned = sanitizeHtml(String(value || ""), {
    allowedTags,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
      span: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          ...(attribs.target === "_blank" ? { target: "_blank" } : {}),
        },
      }),
      img: (_tagName, attribs) => ({
        tagName: "img",
        attribs: { ...attribs, loading: "lazy", decoding: "async" },
      }),
    },
    disallowedTagsMode: "discard",
    enforceHtmlBoundary: true,
  })
  // Old WordPress bodies can retain a caption-only figure after the broken
  // image is removed. Never render a visual container without an image.
  return cleaned.replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi, (figure) => /<img\b/i.test(figure) ? figure : "")
}
