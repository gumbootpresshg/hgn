import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";

const items = [
  ["Community notices", "Short posts for school notices, meeting reminders, closures and public updates."],
  ["Road / ferry watch", "A public-facing spot for HGN staff to point readers toward verified travel updates."],
  ["Sports tonight", "Scores, tournaments, school games and rec league notes."],
  ["Around town", "Restaurant specials, local shows, fundraisers and weekend happenings."],
];

export default function IslandBulletin() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader eyebrow="Daily useful info" title="Island Bulletin" description="A quick-read community board for notices that are important but do not need a full article." />
      <div className="grid gap-5 md:grid-cols-4">
        {items.map(([title, text]) => <article key={title} className="hgn-card p-5"><h2 className="text-2xl font-black text-hgnNavy">{title}</h2><p className="mt-2 text-sm text-slate-600">{text}</p></article>)}
      </div>
      <Link href="/reader-reporter" className="hgn-btn-primary mt-8">Send a bulletin item</Link>
    </main>
  );
}
