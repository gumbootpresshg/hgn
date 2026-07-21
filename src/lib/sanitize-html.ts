import sanitizeHtml from "sanitize-html"

const allowedTags = [
  "p", "br", "strong", "em", "b", "i", "u", "s", "blockquote", "ul", "ol", "li",
  "h2", "h3", "h4", "a", "figure", "figcaption", "img", "hr", "code", "pre", "span"
]

export function sanitizeArticleHtml(value?: string | null) {
  return sanitizeHtml(String(value || ""), {
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
}
