import Link from "next/link";

type DailyItem = {
  id?: string;
  title?: string | null;
  type?: string | null;
  href?: string | null;
  summary?: string | null;
  town?: string | null;
};

export default function IslandDailyStrip({ items = [] }: { items?: DailyItem[] }) {
  const fallback: DailyItem[] = [
    { title: "Events", href: "/events", summary: "See what is happening today and this weekend." },
    { title: "Live Map", href: "/live-map", summary: "Community pins, alerts and island activity." },
    { title: "Weather", href: "/weather", summary: "Current town forecasts and marine resources." },
    { title: "Support HGN", href: "/support", summary: "Help keep local journalism free for everyone." },
  ];
  const cards = items.length ? items : fallback;

  return (
    <section className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 border-b pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-hgnBlue">Island Daily</p>
          <h2 className="text-2xl font-black text-hgnNavy">Open this first</h2>
        </div>
        <Link href="/island-daily" className="text-sm font-black text-hgnBlue hover:underline">
          View daily board →
        </Link>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {cards.slice(0, 4).map((item, index) => (
          <Link key={item.id || `${item.title}-${index}`} href={item.href || "/island-daily"} className="rounded-2xl bg-slate-50 p-4 hover:bg-slate-100">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">{item.town || item.type || "HGN"}</p>
            <h3 className="mt-1 text-lg font-black text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.summary}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
