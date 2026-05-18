import Link from "next/link";

const items = [
  ["Today on Haida Gwaii", "/events", "Events, meetings, sports and community happenings."],
  ["Notices", "/notices", "Read legal, government, legislative, regulatory and required corporate notices."],
  ["Obituaries", "/obituaries", "Memorial notices and obituary submissions."],
  ["Support Local News", "/support", "Help keep Haida Gwaii News free for readers."],
];

export default function BetaLaunchPanel() {
  return (
    <section className="my-8 rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-hgnBlue">Daily useful</p>
          <h2 className="mt-1 text-3xl font-black text-hgnNavy">Open this first every morning</h2>
        </div>
        <Link href="/events" className="rounded-full bg-hgnNavy px-5 py-3 text-sm font-black text-white">View calendar</Link>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {items.map(([title, href, desc]) => (
          <Link key={href} href={href} className="rounded-2xl bg-slate-50 p-4 hover:bg-slate-100">
            <h3 className="font-black text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
