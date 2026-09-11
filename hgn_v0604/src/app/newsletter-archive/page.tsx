import Link from "next/link";
import { getPublicNewsletterEditions, newsletterTone, newsletterToneClasses } from "@/lib/newsletter-dispatch";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Newsletter Archive | HGN",
  description: "Recent HGN newsletter editions and beta reader updates from Haida Gwaii.",
};

export default async function NewsletterArchivePage() {
  const editions = await getPublicNewsletterEditions();
  return <main className="mx-auto max-w-6xl px-4 py-12">
    <section className="rounded-3xl bg-hgnNavy p-8 text-white shadow-sm md:p-12">
      <p className="text-sm font-black uppercase tracking-widest text-white/70">HGN Newsletter Archive</p>
      <h1 className="mt-3 max-w-4xl text-5xl font-black">Reader updates, beta notes and local story roundups.</h1>
      <p className="mt-5 max-w-3xl text-lg text-white/85">Browse recent HGN newsletter editions. During beta, this page helps readers catch up on updates they missed and gives the newsroom a public record of dispatches.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/newsletter" className="rounded-xl bg-white px-5 py-3 font-black text-hgnNavy">Subscribe</Link><Link href="/beta-updates" className="rounded-xl border border-white/40 px-5 py-3 font-black text-white">Beta updates</Link></div>
    </section>

    <section className="mt-10 grid gap-4">{editions.map((item) => <article key={item.id} className={`rounded-2xl border p-6 shadow-sm ${newsletterToneClasses(newsletterTone(item.status))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{item.edition_type} · {item.audience_segment}</div><h2 className="mt-2 text-3xl font-black">{item.title}</h2>{item.subject_line && <p className="mt-2 text-sm font-bold opacity-80">Subject: {item.subject_line}</p>}{item.intro && <p className="mt-4 whitespace-pre-wrap text-base leading-7 opacity-85">{item.intro}</p>}{item.top_story_title && <div className="mt-4 rounded-xl bg-white/70 p-4"><p className="text-xs font-black uppercase tracking-wide opacity-60">Lead story</p>{item.top_story_url ? <a href={item.top_story_url} className="font-black underline">{item.top_story_title}</a> : <p className="font-black">{item.top_story_title}</p>}</div>}{item.secondary_story_title && <p className="mt-3 text-sm font-semibold opacity-80">Also: {item.secondary_story_title}</p>}{item.editor_note && <p className="mt-4 text-sm opacity-80">Editor note: {item.editor_note}</p>}</article>)}{!editions.length && <div className="rounded-3xl border bg-white p-8 shadow-sm"><h2 className="text-3xl font-black text-hgnNavy">No public newsletter editions yet.</h2><p className="mt-3 text-slate-700">Once the team marks editions as sent or published, they will appear here.</p><Link href="/newsletter" className="mt-5 inline-block hgn-btn-primary">Subscribe to HGN</Link></div>}</section>
  </main>;
}
