import Link from "next/link";
import { getProductionLockSnapshot, productionLockTone } from "@/lib/production-lock";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

const fallbackItems: Row[] = [
  {
    item_title: "Lock the soft-beta feature set",
    item_group: "freeze",
    status: "review",
    priority: "critical",
    notes: "Do not add another workflow surface unless it fixes a launch blocker. Use this pass to make the current site uploadable.",
  },
  {
    item_title: "Run one real publishing path",
    item_group: "newsroom",
    status: "review",
    priority: "high",
    notes: "Create or update one real story, attach media, check homepage placement, verify mobile view, then publish.",
  },
  {
    item_title: "Confirm production environment variables",
    item_group: "deployment",
    status: "review",
    priority: "critical",
    notes: "Check Supabase URL/key, site URL, image domain settings, and any deploy platform variables before upload.",
  },
];

function titleFor(row: Row) {
  return row.item_title || row.test_title || row.note_title || row.rollback_title || "Production lock item";
}

function bodyFor(row: Row) {
  return row.notes || row.expected_result || row.note_body || "Review this before HGN goes online for soft beta.";
}

function LockCard({ row }: { row: Row }) {
  const status = String(row.status || "review");
  const priority = String(row.priority || "medium");
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${productionLockTone(status, priority)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{titleFor(row)}</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-widest">{status}</span>
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-60">
        {row.item_group || row.test_group || row.rollback_group || "production lock"}
      </p>
      <p className="mt-2 text-sm leading-6 opacity-80">{bodyFor(row)}</p>
      {row.owner ? <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">Owner: {row.owner}</p> : null}
    </article>
  );
}

export default async function ProductionLockPage() {
  const snapshot = await getProductionLockSnapshot();
  const lockItems = snapshot.locks.length ? snapshot.locks : fallbackItems;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-sky-300">HGN v138</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black lg:text-5xl">Production Lock</h1>
            <p className="mt-3 max-w-3xl text-slate-200">
              A hardening pass for getting HGN online: freeze the soft-beta scope, confirm the deployment path, and keep the two-person admin/editor workflow calm.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-950">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Lock score</p>
            <p className="mt-1 text-5xl font-black">{snapshot.score}%</p>
            <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-500">{snapshot.recommendation}</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</p>
          <p className="mt-2 text-4xl font-black text-hgnBlue">{snapshot.blockers.length}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Critical open</p>
          <p className="mt-2 text-4xl font-black text-orange-700">{snapshot.criticalOpen.length}</p>
        </div>
        <Link href="/production-lock-status" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Public-safe view</p>
          <p className="mt-2 text-2xl font-black">Lock status</p>
        </Link>
        <Link href="/admin/launch-fix-pack" className="rounded-2xl border bg-white p-5 text-slate-950 shadow-sm transition hover:border-hgnBlue">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Previous step</p>
          <p className="mt-2 text-2xl font-black">Launch fixes</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Lock checklist</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lockItems.map((row, index) => (
            <LockCard key={row.id || titleFor(row) || index} row={row} />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Smoke tests</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.smokeTests.map((row, index) => (
              <LockCard key={row.id || titleFor(row) || index} row={row} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-hgnNavy">Rollback items</h2>
          <div className="mt-4 grid gap-4">
            {snapshot.rollbackItems.map((row, index) => (
              <LockCard key={row.id || titleFor(row) || index} row={row} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
