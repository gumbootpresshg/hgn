import Link from "next/link";

const ways = [
  ["Become a supporter", "Help keep Haida Gwaii News available online and in print for everyone."],
  ["Support through Patreon", "Monthly supporters help fund reporting, photos, editing, printing and website upkeep."],
  ["Advertise locally", "Businesses can support the paper while reaching readers across Haida Gwaii."],
  ["Send stories and photos", "Community contributions make the paper stronger and more local."],
];

export default function SupportLocalNewsPage(){return <main className="mx-auto max-w-6xl px-4 py-10"><section className="rounded-3xl bg-hgnNavy p-8 text-white md:p-12"><p className="text-sm font-black uppercase tracking-wide text-sky-200">Support Us</p><h1 className="mt-3 max-w-4xl text-5xl font-black leading-tight md:text-6xl">Keep Haida Gwaii News free for readers.</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-100">Haida Gwaii News serves local readers with community reporting, notices, obituaries, sports, columns, letters, visitor information and print-paper coverage. Supporters help keep local journalism available to everyone.</p><div className="mt-6 flex flex-wrap gap-3"><a href="https://www.patreon.com/HaidaGwaiiNews" className="rounded-full bg-white px-5 py-3 font-black text-hgnNavy">Support on Patreon</a><Link href="/advertise" className="rounded-full border border-white px-5 py-3 font-black text-white">Advertise With Us</Link></div></section><section className="mt-8 grid gap-5 md:grid-cols-2">{ways.map(([title,desc])=><div key={title} className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">{title}</h2><p className="mt-3 leading-7 text-slate-700">{desc}</p></div>)}</section></main>}
