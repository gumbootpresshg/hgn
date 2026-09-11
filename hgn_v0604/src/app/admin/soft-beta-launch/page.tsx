import Link from "next/link";
import { betaLaunchTone, getSoftBetaLaunchSnapshot } from "@/lib/soft-beta-launch";

export const dynamic = "force-dynamic";

type Row = Record<string, any>;

function StatusCard({ row, labelKey = "title", statusKey = "status" }: { row: Row; labelKey?: string; statusKey?: string }) {
  const label = row[labelKey] || row.task_title || row.check_title || row.route_path || "Launch item";
  const status = row[statusKey] || row.task_status || row.check_status || row.status || "review";

  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${betaLaunchTone(status)}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{label}</h3>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider">{status}</span>
      </div>
      {row.description ? <p className="mt-2 text-sm leading-6 opacity-80">{row.description}</p> : null}
      {row.owner ? <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-70">Owner: {row.owner}</p> : null}
    </article>
  );
}

export default async function SoftBetaLaunchPage() {
  const snapshot = await getSoftBetaLaunchSnapshot();
  const readiness = snapshot.readiness.length ? snapshot.readiness : [
    { title: "Homepage feels fresh", status: "review", description: "Lead story, utilities and local sections should look current on desktop and mobile." },
    { title: "Article publishing path is clean", status: "review", description: "Draft, edit, image, SEO and publish should not require dashboard hopping." },
    { title: "Public beta pages are intentional", status: "review", description: "No unfinished experimental pages should be prominent in navigation." },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-3xl border bg-slate-950 p-6 text-white shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-sky-300">HGN v127</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black lg:text-5xl">Soft Beta Launch Cockpit</h1>
            <p className="mt-3 max-w-3xl text-slate-200">
              A single go-live view for the two-person admin/editor beta. Use this before uploading the site online and again before inviting anyone to look around.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-950">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">Readiness</div>
            <div className="mt-1 text-5xl font-black">{snapshot.score}%</div>
          </div>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</p>
          <p className="mt-2 text-4xl font-black text-hgnBlue">{snapshot.blockers.length}</p>
          <p className="mt-1 text-sm text-slate-600">Must be cleared before soft beta.</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Watch items</p>
          <p className="mt-2 text-4xl font-black text-amber-700">{snapshot.watch.length}</p>
          <p className="mt-1 text-sm text-slate-600">Needs review but may not block upload.</p>
        </div>
        <Link href="/beta-ready" className="rounded-2xl border bg-hgnBlue p-5 text-white shadow-sm transition hover:opacity-90">
          <p className="text-xs font-black uppercase tracking-widest text-white/70">Public view</p>
          <p className="mt-2 text-2xl font-black">Open beta-ready page</p>
          <p className="mt-1 text-sm text-white/80">Use this as the simple status page while testing online.</p>
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-hgnNavy">Go-live readiness</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {readiness.map((row) => <StatusCard key={row.id || row.title} row={row} />)}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-black text-hgnNavy">Go-live tasks</h2>
          <div className="mt-4 grid gap-4">
            {(snapshot.tasks.length ? snapshot.tasks : [
              { task_title: "Run mobile homepage pass", task_status: "review", description: "Check hero, cards, menu, article pages and utility pages on phone." },
              { task_title: "Confirm production env vars", task_status: "review", description: "Supabase URL, anon key, site URL and metadata should match production." },
              { task_title: "Publish test story", task_status: "review", description: "Verify a full draft to published cycle with image and SEO metadata." },
            ]).map((row) => <StatusCard key={row.id || row.task_title} row={row} labelKey="task_title" statusKey="task_status" />)}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-hgnNavy">Public checks</h2>
          <div className="mt-4 grid gap-4">
            {(snapshot.publicChecks.length ? snapshot.publicChecks : [
              { check_title: "Homepage loads cleanly", check_status: "review", description: "No broken sections, missing images or obvious layout jumps." },
              { check_title: "Article page reads well", check_status: "review", description: "Headline, byline, image, body, share metadata and related links are clean." },
              { check_title: "RSS and sitemap reachable", check_status: "review", description: "Check feeds before Google/news discovery work." },
            ]).map((row) => <StatusCard key={row.id || row.check_title} row={row} labelKey="check_title" statusKey="check_status" />)}
          </div>
        </div>
      </section>
    </main>
  );
}
