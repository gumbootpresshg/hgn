import { pageMetadata } from "@/lib/page-metadata"
import Link from "next/link"

export const metadata = pageMetadata("Editorial Standards", "How Haida Gwaii News reports, verifies information, handles sources and corrects errors.", "/editorial-standards")

const standards = [
  ["Accuracy before speed", "We aim to verify names, dates, figures and claims before publication. When information is developing, we identify what is confirmed and what remains unclear."],
  ["Clear sourcing", "We identify sources whenever practical. Anonymous sources are used only when necessary to report information of public interest and when the newsroom can assess their reliability."],
  ["Independence", "Advertising, sponsorship and reader support help fund the publication but do not determine editorial coverage or conclusions."],
  ["Fairness and context", "People and organizations criticized in a story should have a reasonable opportunity to respond when circumstances allow. We work to provide meaningful local context."],
  ["Community submissions", "Letters, notices, photographs and contributed material are reviewed before publication. Published submissions are identified as such and may be edited for length, clarity, fairness or legal concerns."],
  ["Corrections", "When we make a factual mistake, we correct it promptly and transparently. Significant corrections are noted on the story and listed in the public corrections log."],
]

export default function EditorialStandardsPage() { return <main className="mx-auto max-w-5xl px-4 py-10"><p className="text-sm font-black uppercase tracking-[.2em] text-hgnBlue">Haida Gwaii News</p><h1 className="mt-2 font-serif text-5xl font-bold text-hgnNavy">Editorial standards</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">Our commitment is to useful, independent local journalism that readers can question, understand and trust.</p><section className="mt-8 grid gap-4">{standards.map(([title, text]) => <article key={title} className="rounded-3xl border bg-white p-6 shadow-sm"><h2 className="font-serif text-2xl font-bold text-hgnNavy">{title}</h2><p className="mt-2 leading-7 text-slate-700">{text}</p></article>)}</section><section className="mt-8 rounded-3xl border border-hgnBlue bg-blue-50 p-6"><h2 className="font-serif text-2xl font-bold text-hgnNavy">Raise a concern</h2><p className="mt-2 leading-7 text-slate-700">If you believe a story needs correction, clarification or additional context, please tell us.</p><div className="mt-4 flex flex-wrap gap-4"><Link href="/corrections" className="font-bold underline">Request a correction →</Link><Link href="/corrections-log" className="font-bold underline">Corrections log →</Link></div></section></main> }
