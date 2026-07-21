import Link from "next/link";

const items = [
  { title: "What’s Happening", href: "/events", desc: "Today, this weekend, and upcoming community events." },
  { title: "Live Map", href: "/live-map", desc: "Alerts, closures, events, and island notices in one place." },
  { title: "Community Pulse", href: "/community-pulse", desc: "Vote in the latest HGN reader poll." },
  { title: "Support Local News", href: "/support", desc: "Help keep the paper and website free for everyone." },
];

export default function DailyUseStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-4 md:grid-cols-4">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md">
            <h2 className="text-xl font-black text-hgnNavy">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
