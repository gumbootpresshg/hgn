import { SectionHeader } from "@/components/SectionHeader";

const cards = [
  { kicker: "Social", title: "Facebook / Instagram / X", text: "Embed or curate social posts from HGN and local businesses." },
  { kicker: "Photos", title: "Photo of the Week", text: "Reader-submitted photos can drive engagement." },
  { kicker: "Reporter Rewards", title: "Reader Tips", text: "Gamify accepted tips, photos and breaking news submissions." }
];

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader eyebrow="Community Feed" title="Island Life Social Feed" description="Aggregate public posts, HGN updates, hashtags and tagged businesses so the site feels alive." />
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => <article key={card.title} className="hgn-card p-5"><div className="text-xs font-black uppercase text-hgnBlue">{card.kicker}</div><h2 className="mt-1 text-xl font-black text-hgnNavy">{card.title}</h2><p className="mt-2 leading-7 text-slate-600">{card.text}</p></article>)}
      </div>
    </main>
  );
}
