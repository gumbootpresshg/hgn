import { SectionHeader } from "@/components/SectionHeader";

const cards = [
  { kicker: "Archive", title: "Searchable Old Editions", text: "Digitized past issues become a long-term local history asset." },
  { kicker: "Daily", title: "On This Day", text: "A homepage feature that resurfaces old headlines and photos." },
  { kicker: "Community", title: "Reader Memories", text: "Readers can submit photos, clippings and stories for review." }
];

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader eyebrow="Archives" title="Haida Gwaii History Vault" description="Old newspaper scans, past editions and On This Day in Haida Gwaii nostalgia content." />
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => <article key={card.title} className="hgn-card p-5"><div className="text-xs font-black uppercase text-hgnBlue">{card.kicker}</div><h2 className="mt-1 text-xl font-black text-hgnNavy">{card.title}</h2><p className="mt-2 leading-7 text-slate-600">{card.text}</p></article>)}
      </div>
    </main>
  );
}
