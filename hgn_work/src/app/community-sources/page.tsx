import Link from "next/link";

export const metadata = {
  title: "Community Sources | HGN",
  description: "Help HGN build a trusted local source network for Haida Gwaii news, events, notices and public-interest reporting.",
};

export default function CommunitySourcesPage() {
  const areas = ["Local government", "Schools and youth", "Sports", "Arts and culture", "Emergency updates", "Business", "Ferries and travel", "Community events"];
  return <main className="mx-auto max-w-6xl px-4 py-12">
    <section className="rounded-3xl bg-hgnNavy p-8 text-white shadow-sm md:p-12">
      <p className="text-sm font-black uppercase tracking-widest text-red-200">HGN Source Network</p>
      <h1 className="mt-3 max-w-4xl text-5xl font-black">Help us build a trusted local news network for Haida Gwaii.</h1>
      <p className="mt-5 max-w-3xl text-lg text-white/80">HGN is preparing for beta. We are looking for reliable community contacts who can help point us toward accurate updates, useful notices and public-interest stories.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/news-tips" className="rounded-xl bg-white px-5 py-3 font-black text-hgnNavy">Send a news tip</Link><Link href="/contact" className="rounded-xl border border-white/40 px-5 py-3 font-black text-white">Contact the newsroom</Link></div>
    </section>

    <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{areas.map((area) => <div key={area} className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="font-black text-hgnNavy">{area}</h2><p className="mt-2 text-sm text-slate-600">Share context, upcoming items, corrections or people we should talk to.</p></div>)}</section>

    <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">What makes a good source?</h2><ul className="mt-4 space-y-3 text-slate-700"><li>• You know a topic, place, group or event well.</li><li>• You can help us verify names, dates, locations or context.</li><li>• You are comfortable being contacted by the newsroom.</li><li>• You understand that HGN still needs to independently verify information before publishing.</li></ul></div>
      <div className="hgn-card p-6"><h2 className="text-2xl font-black text-hgnNavy">How we use source information</h2><p className="mt-3 text-slate-700">Source notes help the newsroom decide what to check, who to contact and what deserves follow-up. Being a source does not guarantee publication, and HGN may still ask for documents, additional confirmation or on-the-record comment.</p><p className="mt-3 text-slate-700">For urgent public safety information, contact emergency services first. HGN can help amplify confirmed community updates after they are safe and verified.</p></div>
    </section>
  </main>;
}
