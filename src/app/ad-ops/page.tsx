import { SectionHeader } from "@/components/SectionHeader";
import Link from "next/link";

type Card = { kicker: string; title: string; text: string; href?: string };

const cards: Card[] = [{"kicker":"Online","title":"Homepage + Article Ads","text":"Sell banner, sidebar, sponsored-card and category sponsorship placements."},{"kicker":"Print","title":"Print Ad Pipeline","text":"Request → artwork → proof → approved → placed → invoiced."},{"kicker":"Directory","title":"Premium Listings","text":"Business profiles with photos, hours, coupons, menus and featured placement."},{"kicker":"Deals","title":"Coupon Campaigns","text":"Monthly recurring coupon/deal packages for local businesses."}];

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader eyebrow="Revenue" title="Ad Ops Board" description="A practical revenue command centre for print ads, online banners, coupons, directory upgrades and sponsored campaigns." />
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
