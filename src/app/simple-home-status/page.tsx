import Link from "next/link";
import { getSimpleAdminHomeSnapshot, simpleHomeTone } from "@/lib/simple-admin-home";

export const dynamic = "force-dynamic";

export default async function SimpleHomeStatusPage() {
  const snapshot = await getSimpleAdminHomeSnapshot();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="border-b pb-6">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Admin cleanup status</p>
        <h1 className="mt-2 text-4xl font-black text-hgnNavy">Simple Home Status</h1>
        <p className="mt-2 max-w-2xl text-slate-600">A public-safe status view for the admin home consolidation pass.</p>
        <Link href="/admin/simple-home" className="mt-4 inline-flex hgn-btn-primary">Open Simple Admin Home</Link>
      </div>

      <section className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-black uppercase tracking-widest text-slate-500">Simple score</div>
        <div className="mt-2 text-6xl font-black text-hgnNavy">{snapshot.score}%</div>
        <p className="mt-3 text-slate-600">Target: keep the daily admin/editor path to a small set of primary tools.</p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {snapshot.cards.map((card) => (
          <div key={card.id || card.href} className={`rounded-2xl border p-5 ${simpleHomeTone(card.card_status, card.card_group)}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">{card.card_group} / {card.card_status}</div>
            <h2 className="mt-2 text-xl font-black">{card.title}</h2>
            {card.description ? <p className="mt-2 text-sm leading-6 opacity-80">{card.description}</p> : null}
          </div>
        ))}
      </section>
    </main>
  );
}
