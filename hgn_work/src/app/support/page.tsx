import Link from "next/link";

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-3xl bg-hgnNavy p-8 text-white md:p-12">
        <p className="text-sm font-black uppercase tracking-wide text-white/70">Support local journalism</p>
        <h1 className="mt-3 text-4xl font-black md:text-6xl">Help keep Haida Gwaii News free for everyone.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">
          Reader support, Patreon supporters, donations, print subscribers, and local advertisers help keep community news accessible across Haida Gwaii.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="https://www.patreon.com/HaidaGwaiiNews" className="rounded-full bg-white px-5 py-3 text-sm font-black text-hgnNavy">Support on Patreon</a>
          <Link href="/advertise" className="rounded-full border border-white/40 px-5 py-3 text-sm font-black text-white">Advertise with HGN</Link>
        </div>
      </section>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["Reader supported", "Small contributions help keep local reporting available without locking stories behind a paywall."],
          ["Local advertisers", "Advertising with HGN supports the print paper, website, community features, and reporting."],
          ["Community first", "Your support helps cover island news, events, notices, obituaries, sports, and local voices."]
        ].map(([title, text]) => <div key={title} className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-slate-950">{title}</h2><p className="mt-3 text-slate-600">{text}</p></div>)}
      </section>
    </main>
  );
}
