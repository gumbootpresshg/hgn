import { SectionHeader } from "@/components/SectionHeader";

const cards = [
  { kicker: "Employers", title: "Post a Job", text: "Paid job postings with company info and application instructions." },
  { kicker: "Workers", title: "Find Local Work", text: "Filter jobs by town, season, trade, hospitality, government and remote." },
  { kicker: "Revenue", title: "Featured Hiring", text: "Charge employers for highlighted listings and print bundles." }
];

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader eyebrow="Hiring" title="Local Job Board" description="A dedicated job board for island employers, with paid posts and featured hiring packages." />
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => <article key={card.title} className="hgn-card p-5"><div className="text-xs font-black uppercase text-hgnBlue">{card.kicker}</div><h2 className="mt-1 text-xl font-black text-hgnNavy">{card.title}</h2><p className="mt-2 leading-7 text-slate-600">{card.text}</p></article>)}
      </div>
    </main>
  );
}
