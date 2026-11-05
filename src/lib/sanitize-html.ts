import sanitizeHtml from "sanitize-html"

const allowedTags = [
  "p", "br", "strong", "em", "b", "i", "u", "s", "blockquote", "ul", "ol", "li",
  "h2", "h3", "h4", "a", "figure", "figcaption", "img", "hr", "code", "pre", "span", "div"
]

function normalizeEditorParagraphBlocks(html: string) {
  // Browsers use div blocks for Enter inside contentEditable. Normalize them
  // before sanitizing because unsupported wrappers would otherwise be removed
  // along with every paragraph boundary.
  return html
    .replace(/<div\b[^>]*>/gi, "<p>")
    .replace(/<\/div>/gi, "</p>")
}

function restorePlainTextParagraphs(html: string) {
  // The newer editor can save a simple text article instead of HTML. Browsers
  // collapse its line breaks unless we turn its blank-line breaks into <p>s.
  // Existing rich-text articles already contain tags and are left untouched.
  if (!html.trim() || /<\/?[a-z][^>]*>/i.test(html)) return html

  return html
    .trim()
    .split(/\n\s*\n+/)
    .map(paragraph => "<p>" + paragraph.trim().replace(/\n/g, "<br />") + "</p>")
    .join("")
}

export function sanitizeArticleHtml(value?: string | null) {
  const editorHtml = normalizeEditorParagraphBlocks(String(value || ""))
  const cleaned = sanitizeHtml(editorHtml, {
    allowedTags,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
      span: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    transformTags: {
      // contentEditable and pasted Word/Google Docs text commonly use <div>
      // for each paragraph. Preserve the break, but publish semantic <p>s.
      div: () => ({ tagName: "p", attribs: {} }),
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

  const withoutEmptyFigures = cleaned.replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi, (figure) => /<img\b/i.test(figure) ? figure : "")
  return restorePlainTextParagraphs(withoutEmptyFigures)
}
