import { SectionHeader } from "@/components/SectionHeader";

const cards = [
  { kicker: "Travel", title: "Ferry Terminal Cams", text: "Future embeds for lineup and terminal conditions." },
  { kicker: "Weather", title: "Harbour & Beach Cams", text: "Useful for boaters, surfers, fishers and visitors." },
  { kicker: "Roads", title: "Highway Conditions", text: "Road cams and status links become powerful during storms." }
];

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader eyebrow="Live Views" title="Island Cam Network" description="Embed webcams from ferry terminals, beaches, harbours, highways and weather stations so readers check back constantly." />
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => <article key={card.title} className="hgn-card p-5"><div className="text-xs font-black uppercase text-hgnBlue">{card.kicker}</div><h2 className="mt-1 text-xl font-black text-hgnNavy">{card.title}</h2><p className="mt-2 leading-7 text-slate-600">{card.text}</p></article>)}
      </div>
    </main>
  );
}
