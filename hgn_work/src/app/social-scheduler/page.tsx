import { SectionHeader } from "@/components/SectionHeader";
import Link from "next/link";

type Card = { kicker: string; title: string; text: string; href?: string };

const cards: Card[] = [{"kicker":"Facebook","title":"Community Post","text":"Headline, short context, image and comments prompt."},{"kicker":"Instagram","title":"Visual Caption","text":"Photo-first caption with local hashtags and story link reminder."},{"kicker":"LinkedIn","title":"Business / Community Angle","text":"Good for advertisers, economic development, hiring and civic coverage."},{"kicker":"X","title":"Breaking / Travel Updates","text":"Short alerts for ferry, weather, sports scores and breaking news."}];

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader eyebrow="Growth" title="Social Scheduler" description="Turn each story into social posts and keep HGN visible across Facebook, Instagram, X and LinkedIn." />
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
