import { SectionHeader } from "@/components/SectionHeader";
import Link from "next/link";

type Card = { kicker: string; title: string; text: string; href?: string };

const cards: Card[] = [{"kicker":"Stay","title":"Places to Stay","text":"Hotels, cabins, campsites, lodges and short-term rentals with premium directory upgrades later.","href":"/business-directory"},{"kicker":"Eat","title":"Where to Eat","text":"Restaurants, coffee, fish and chips, specials, hours and seasonal closures.","href":"/deals"},{"kicker":"Go","title":"Travel Alerts","text":"Ferries, flights, roads, weather and emergency notices in one travel-friendly page.","href":"/ferry-tracker"},{"kicker":"Do","title":"Tours + Experiences","text":"Hikes, beaches, fishing charters, cultural experiences, art, shops and events.","href":"/today"},{"kicker":"Safety","title":"Emergency Info","text":"Clinics, pharmacy, RCMP, fire, tsunami notes, outages and storm mode.","href":"/emergency"},{"kicker":"Ask","title":"Ask a Local","text":"Visitor questions can become searchable local advice articles and community answers.","href":"/ask-a-local"}];

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader eyebrow="Visitor Guide" title="Visitor Mode" description="A cleaner front door for tourists and off-island readers who need practical Haida Gwaii information fast." />
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="hgn-card p-6">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-hgnBlue">{card.kicker}</div>
            <h2 className="mt-2 text-2xl font-black text-hgnNavy">{card.title}</h2>
            <p className="mt-3 leading-7 text-slate-700">{card.text}</p>
            {card.href && <Link href={card.href} className="mt-5 inline-flex font-bold text-hgnBlue">Open →</Link>}
          </div>
        ))}
      </div>
    </main>
  );
}
