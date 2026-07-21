import { SectionHeader } from "@/components/SectionHeader";

const cards = [
  { kicker: "Food", title: "Restaurant Specials", text: "Breakfast deals, dinner specials, coffee offers and weekend features." },
  { kicker: "Retail", title: "Shop Local Offers", text: "Coupons for local stores, outfitters, services and seasonal promotions." },
  { kicker: "Ads", title: "Sponsored Placement", text: "Businesses can pay monthly for top placement online and in the paper." }
];

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader eyebrow="Recurring Revenue" title="Local Deals / Coupons" description="Businesses can upload coupons and monthly offers, creating a simple recurring online ad product." />
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => <article key={card.title} className="hgn-card p-5"><div className="text-xs font-black uppercase text-hgnBlue">{card.kicker}</div><h2 className="mt-1 text-xl font-black text-hgnNavy">{card.title}</h2><p className="mt-2 leading-7 text-slate-600">{card.text}</p></article>)}
      </div>
    </main>
  );
}
