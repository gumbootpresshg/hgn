import Link from "next/link";
const alerts = [
  ["Weather", "Storms, wind, rainfall and winter road notes", "/weather"],
  ["Ferry", "Sailing cancellations, delays and terminal notices", "/ferry-tracker"],
  ["Roads", "Closures, washouts, construction and hazards", "/live-map"],
  ["Power / emergency", "Outages, emergency mode and public safety notices", "/emergency"],
];
export default function AlertsPage(){return <main className="mx-auto max-w-7xl px-4 py-8"><section className="rounded-2xl bg-hgnRed p-6 text-white md:p-8"><div className="text-sm font-black uppercase tracking-widest">HGN Alerts</div><h1 className="mt-2 text-5xl font-black">Island alert centre</h1><p className="mt-4 max-w-3xl">A future home for verified local alerts. Admins can use this as the public command area during bad weather, road closures or ferry disruption.</p></section><section className="mt-8 grid gap-5 md:grid-cols-4">{alerts.map(([title,text,href])=><Link key={title} href={href} className="hgn-card block p-5"><h2 className="text-2xl font-black text-hgnNavy">{title}</h2><p className="mt-2 text-sm text-slate-600">{text}</p></Link>)}</section></main>}
