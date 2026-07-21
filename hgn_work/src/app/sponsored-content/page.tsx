import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";

const packages = [
  ["Sponsored story", "A clearly labelled business feature with photos, links and social sharing."],
  ["Homepage takeover", "A time-limited premium placement for major campaigns or events."],
  ["Print + online bundle", "A print ad paired with online banner, directory listing and social boost."],
];

export default function SponsoredContent(){return <main className="mx-auto max-w-7xl px-4 py-10"><SectionHeader eyebrow="Revenue" title="Sponsored Content" description="A clean, transparent area for paid stories and advertiser campaigns."/><div className="grid gap-5 md:grid-cols-3">{packages.map(([t,d])=><article key={t} className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">{t}</h2><p className="mt-2 text-slate-600">{d}</p></article>)}</div><Link href="/advertise" className="hgn-btn-primary mt-8">Ask about packages</Link></main>}
