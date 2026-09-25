import Link from "next/link"
import type { SitePageBlock } from "@/lib/cms/site-pages"

export function SitePageRenderer({ blocks }: { blocks: SitePageBlock[] }) {
  return <div className="space-y-6">{(blocks || []).map((block) => {
    if (block.type === "heading") {
      const cls = block.level === 3 ? "text-2xl" : "text-3xl"
      return <h2 key={block.id} className={`font-serif font-bold text-slate-950 ${cls}`}>{block.content}</h2>
    }
    if (block.type === "image") return <figure key={block.id} className="overflow-hidden rounded-2xl border bg-white"><img src={block.url || ""} alt={block.alt || ""} className="w-full object-cover"/></figure>
    if (block.type === "quote") return <blockquote key={block.id} className="border-l-4 border-hgnBlue pl-5 font-serif text-2xl italic text-slate-700">{block.content}</blockquote>
    if (block.type === "button") {
      const href = block.url || "/"
      const external = /^https?:\/\//i.test(href)
      return external ? <a key={block.id} href={href} target="_blank" rel="noreferrer" className="hgn-btn-primary mr-2 inline-flex">{block.label || "Open link"}</a> : <Link key={block.id} href={href} className="hgn-btn-primary mr-2 inline-flex">{block.label || "Open link"}</Link>
    }
    if (block.type === "table") {
      const headers = Array.isArray(block.tableHeaders) ? block.tableHeaders : []
      const rows = Array.isArray(block.tableRows) ? block.tableRows : []
      return <div key={block.id} className="overflow-x-auto rounded-2xl border border-stone-300"><table className="min-w-full text-left text-sm"><thead className="bg-stone-100 text-xs font-bold uppercase tracking-wide text-stone-600"><tr>{headers.map((header, index) => <th key={`${header}-${index}`} className="px-4 py-3">{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={`${block.id}-${rowIndex}`} className="border-t border-stone-200">{headers.map((_, columnIndex) => <td key={columnIndex} className="px-4 py-3 text-slate-700">{row[columnIndex] || ""}</td>)}</tr>)}</tbody></table></div>
    }
    if (block.type === "divider") return <hr key={block.id} className="border-stone-300"/>
    if (block.type === "callout") return <div key={block.id} className="whitespace-pre-line rounded-2xl border border-amber-200 bg-amber-50 p-5 leading-7 text-amber-950">{block.content}</div>
    return <p key={block.id} className="text-lg leading-8 text-slate-700">{block.content}</p>
  })}</div>
}
