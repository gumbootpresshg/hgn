import { SectionHeader } from "@/components/SectionHeader";
import Link from "next/link";

type Card = { kicker: string; title: string; text: string; href?: string };

const cards: Card[] = [{"kicker":"Front","title":"Front Page Package","text":"Choose lead story, hero photo, secondary story and urgent notices."},{"kicker":"Sections","title":"Section Budget","text":"Local news, sports, letters, obits, classifieds, events and visitor info."},{"kicker":"Ads","title":"Ad Placement","text":"Connect ad requests to print pages, sizes, proofs, invoice status and final artwork."},{"kicker":"Final","title":"Digital Flipbook Upload","text":"Upload the PDF or flipbook link when the print issue is final."}];

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader eyebrow="Print Paper" title="Print Edition Planner" description="A weekly production board for turning digital stories, ads and community submissions into the print issue." />
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
