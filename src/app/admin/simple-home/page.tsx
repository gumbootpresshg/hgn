import Link from "next/link";
import { getSimpleAdminHomeSnapshot, simpleHomeTone } from "@/lib/simple-admin-home";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

function CardLink({ card }: { card: Row }) {
  return (
    <Link href={card.href || "/admin"} className={`rounded-2xl border p-5 shadow-sm transition hover:border-hgnBlue ${simpleHomeTone(card.card_status, card.card_group)}`}>
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest opacity-70">
        <span>{card.card_group}</span>
        <span>{card.card_status}</span>
      </div>
      <h3 className="mt-2 text-xl font-black">{card.title}</h3>
      {card.description ? <p className="mt-2 text-sm leading-6 opacity-80">{card.description}</p> : null}
    </Link>
  );
}

function CardGroup({ title, helper, cards }: { title: string; helper: string; cards: Row[] }) {
  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-2xl font-black text-hgnNavy">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{helper}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.length ? cards.map((card) => <CardLink key={card.id || card.href} card={card} />) : <div className="rounded-2xl border border-dashed bg-slate-50 p-5 text-sm text-slate-600">Nothing in this group yet.</div>}
      </div>
    </section>
  );
}

export default async function SimpleAdminHomePage() {
  const snapshot = await getSimpleAdminHomeSnapshot();
  const stats = [
    ["Simple score", `${snapshot.score}%`, "How clean the admin entry point feels"],
    ["Primary tools", snapshot.primary.length, "Daily path only"],
    ["Occasional", snapshot.occasional.length, "Useful, but not daily"],
    ["Parked", snapshot.parked.length, "Good clutter reduction"],
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">v122 Simple Admin Home</p>
          <h1 className="mt-2 text-5xl font-black text-hgnNavy">Simple Admin Home</h1>
          <p className="mt-3 max-w-3xl text-slate-700">
            A cleaner starting point for the two-person admin/editor beta. The goal is one obvious daily path, with everything else moved into occasional or parked use.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/daily-route" className="hgn-btn-dark">Daily Route</Link>
          <Link href="/admin/newsroom-hub" className="hgn-btn-dark">Newsroom Hub</Link>
          <Link href="/admin/core-workflow" className="hgn-btn-dark">Core Workflow</Link>
          <Link href="/simple-home-status" className="hgn-btn-primary">Status</Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, helper]) => (
          <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</div>
            <div className="mt-2 text-4xl font-black text-hgnNavy">{value}</div>
            <p className="mt-2 text-sm text-slate-600">{helper}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-10">
        <CardGroup title="Daily path" helper="These should be enough for a normal publishing day." cards={snapshot.primary} />
        <CardGroup title="Cleanup path" helper="Use these to keep the admin side from spreading again." cards={snapshot.cleanup} />
        <CardGroup title="Occasional tools" helper="Useful when needed, but not part of the daily route." cards={snapshot.occasional} />
        <CardGroup title="Parked or hidden" helper="Available if needed, but intentionally out of the normal flow." cards={snapshot.parked} />
      </div>
    </main>
  );
}
