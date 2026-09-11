import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";

const items = [
  ["Add an event", "/submit-event", "Meetings, fundraisers, concerts, sports games and community notices."],
  ["Send a tip", "/reader-reporter", "Photos, videos, breaking news leads and reader reports."],
  ["Post a listing", "/marketplace/new", "Buy/sell, rentals, services, jobs, equipment and local finds."],
  ["Ask Annie", "/ask-annie", "Local questions, advice, community questions and island life notes."],
  ["Submit to Live Map", "/live-map/submit", "Map-worthy notices for editor review."],
  ["Letter to the editor", "/submit-letter", "Formal letters and community opinions."],
  ["Community standards", "/community-standards", "How HGN reviews, edits and moderates submissions before publication."],
];

export default function CommunityBoard(){
  return <main className="mx-auto max-w-6xl px-4 py-10"><SectionHeader eyebrow="Community Board" title="Send something to Haida Gwaii News" description="One place for reader submissions. HGN editors approve what should be published, mapped or held for the paper."/><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map(([title, href, desc])=><Link key={href} href={href} className="hgn-card block p-6"><h2 className="text-2xl font-black text-hgnNavy">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p></Link>)}</div></main>
}
