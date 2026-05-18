import { SectionHeader } from "@/components/SectionHeader";

const cards = [
  { kicker: "Ferries", title: "Schedule + Delays", text: "Future integration with ferry status and sailing notices." },
  { kicker: "Flights", title: "Local Flight Watch", text: "Pacific Coastal and local flight status links can live here." },
  { kicker: "Weather", title: "Travel Impacts", text: "Wind, storm and visibility notes for travellers." }
];

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader eyebrow="Travel Status" title="Ferry / Flight Tracker" description="A travel dashboard for BC Ferries, local flights, weather impacts, cancellations and visitor-friendly links." />
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => <article key={card.title} className="hgn-card p-5"><div className="text-xs font-black uppercase text-hgnBlue">{card.kicker}</div><h2 className="mt-1 text-xl font-black text-hgnNavy">{card.title}</h2><p className="mt-2 leading-7 text-slate-600">{card.text}</p></article>)}
      </div>
    </main>
  );
}
