import { SectionHeader } from "@/components/SectionHeader";

const cards = [
  { kicker: "Schools", title: "Announcements", text: "School notices, schedules and event updates." },
  { kicker: "Scores", title: "Local Standings", text: "Rec league and youth sports scores in one place." },
  { kicker: "Media", title: "Photos & Highlights", text: "Parents and teams can submit photos for editor review." }
];

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader eyebrow="Island Sports" title="School & Sports Desk" description="School announcements, youth teams, tournaments, rec league standings, photos and local sports scores." />
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => <article key={card.title} className="hgn-card p-5"><div className="text-xs font-black uppercase text-hgnBlue">{card.kicker}</div><h2 className="mt-1 text-xl font-black text-hgnNavy">{card.title}</h2><p className="mt-2 leading-7 text-slate-600">{card.text}</p></article>)}
      </div>
    </main>
  );
}
