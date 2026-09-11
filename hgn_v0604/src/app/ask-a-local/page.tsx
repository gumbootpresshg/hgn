import { SectionHeader } from "@/components/SectionHeader";
import Link from "next/link";

type Card = { kicker: string; title: string; text: string; href?: string };

const cards: Card[] = [{"kicker":"Visitors","title":"Travel Questions","text":"Where to camp, where to eat, what to do when ferries change, and how to prepare for weather."},{"kicker":"Residents","title":"Local Knowledge","text":"Recommendations, service notices, road questions, event details and practical answers."},{"kicker":"Editorial","title":"Convert to Articles","text":"Editors can turn repeated questions into searchable HGN guides."}];

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader eyebrow="Community" title="Ask a Local" description="A future community Q&A area for visitors and residents. Great questions can become evergreen articles." />
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
