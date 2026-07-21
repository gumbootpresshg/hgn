import { SectionHeader } from "@/components/SectionHeader";
import Link from "next/link";

type Card = { kicker: string; title: string; text: string; href?: string };

const cards: Card[] = [{"kicker":"Idea","title":"Story Ideas","text":"Council, schools, sports, weather, fisheries, business openings, ferry issues and community wins."},{"kicker":"Assign","title":"Writer / Photographer","text":"Add writer, photographer, deadline, category, required images and print priority."},{"kicker":"Status","title":"Draft → Edit → Publish","text":"Move from idea to assigned to draft to edited to published to print-ready."}];

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader eyebrow="Newsroom" title="Assignment Desk" description="A lightweight story-planning board. The public submission form can feed tips into this, while editors assign and prioritize stories." />
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
