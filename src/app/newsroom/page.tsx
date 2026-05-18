import { SectionHeader } from "@/components/SectionHeader";
import Link from "next/link";

type Card = { kicker: string; title: string; text: string; href?: string };

const cards: Card[] = [{"kicker":"Planning","title":"Assignment Desk","text":"Track story ideas, assigned writers, due dates, photo needs and print priority before stories hit the public site.","href":"/assignment-desk"},{"kicker":"Media","title":"Media Library","text":"A future upload area for photos, videos and documents. The v4 page gives the structure, Supabase storage notes and editor workflow.","href":"/media-library"},{"kicker":"Print","title":"Print Edition Planner","text":"Plan the weekly paper: front page, local news, sports, ads, obituaries, classifieds and final PDF upload.","href":"/print-planner"},{"kicker":"Tips","title":"Reader Reporter Queue","text":"Review incoming tips, photos and videos from the public and convert the best ones into assignments.","href":"/reader-reporter"},{"kicker":"Social","title":"Social Scheduler","text":"Draft Facebook, Instagram, X and LinkedIn captions for each published article and campaign.","href":"/social-scheduler"},{"kicker":"Revenue","title":"Ad Ops Board","text":"Track online banners, print ads, sponsored content, coupons, directory upsells and invoice status.","href":"/ad-ops"}];

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <SectionHeader eyebrow="Editorial Workflow" title="Newsroom Command Centre" description="A practical internal workflow centre for editors, contributors, photographers, video clips, print planning and digital publishing." />
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="hgn-card p-6">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-hgnBlue">{card.kicker}</div>
            <h2 className="mt-2 text-2xl font-black text-hgnNavy">{card.title}</h2>
            <p className="mt-3 leading-7 text-slate-700">{card.text}</p>
            {card.href && <Link href={card.href} className="mt-5 inline-flex font-bold text-hgnBlue">Open →</Link>}
          </div>
        ))}
      </div>
    </main>
  );
}
