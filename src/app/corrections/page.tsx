import CorrectionsForm from "@/components/CorrectionsForm"
import Link from "next/link"
import { ManagedInfoPage } from "@/components/cms/ManagedInfoPage"
import { pageMetadata } from "@/lib/page-metadata"

export const metadata = pageMetadata("Corrections & Clarifications", "Request a correction or clarification from the Haida Gwaii News newsroom.", "/corrections")

const fallback = { title: "Corrections & clarifications", eyebrow: "Accuracy", description: "See something that needs correcting? Send the newsroom a clear note and a link to the story.", blocks: [
  { id: "corrections-note", type: "callout" as const, content: "Please include the story URL or headline, the information you believe needs review, and any reliable source that helps us check it." },
] }

export default function CorrectionsPage() { return <ManagedInfoPage systemKey="corrections" fallback={fallback}><section className="mt-8 rounded-3xl border bg-white p-7 shadow-sm"><h2 className="font-serif text-3xl font-bold text-hgnNavy">Our corrections policy</h2><div className="mt-4 space-y-3 leading-7 text-slate-700"><p>We correct factual errors promptly and clearly. When a correction changes the meaning of a story, we add a note to the article and record it in our public corrections log.</p><p>Readers can request a correction using this form. Please include the story link, the specific information that needs review and a source where possible. A request is not published automatically; the newsroom reviews it first.</p></div><Link href="/corrections-log" className="mt-5 inline-block font-bold text-hgnBlue underline">View the public corrections log →</Link></section><CorrectionsForm /></ManagedInfoPage> }
