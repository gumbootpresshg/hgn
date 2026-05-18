import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";

const towns = ["Masset", "Old Massett", "Port Clements", "Tlell", "Skidegate", "Daajing Giids", "Sandspit"];

export default function RestaurantSpecials() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader eyebrow="Local food" title="Restaurant Specials" description="A future daily specials board for restaurants, cafes, food trucks and community meals." />
      <div className="mb-6 flex flex-wrap gap-2">{towns.map(t => <span key={t} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">{t}</span>)}</div>
      <div className="hgn-card p-8"><h2 className="text-3xl font-black text-hgnNavy">Advertiser-ready specials board</h2><p className="mt-3 text-slate-700">Restaurants can eventually submit a daily/weekly special, photo, price, hours and phone number. HGN can approve and feature paid specials on the homepage and Live Map.</p><Link href="/advertise" className="hgn-btn-primary mt-5">Place a food special</Link></div>
    </main>
  );
}
