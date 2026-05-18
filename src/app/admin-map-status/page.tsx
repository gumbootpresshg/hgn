import Link from "next/link";
import { adminMapTone, getAdminMapSnapshot } from "@/lib/admin-map";

export const dynamic = "force-dynamic";

export default async function AdminMapStatusPage() {
  const snapshot = await getAdminMapSnapshot();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="border-b pb-6">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Admin map status</p>
        <h1 className="mt-2 text-5xl font-black text-hgnNavy">{snapshot.score}% simple</h1>
        <p className="mt-3 max-w-2xl text-slate-700">
          Public-light status page for checking whether the internal admin workflow is staying simple enough for the two-person beta.
        </p>
        <Link href="/admin/admin-map" className="mt-5 inline-flex hgn-btn-primary">Open admin map</Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {snapshot.primary.map((tool) => (
          <article key={tool.id} className={`rounded-2xl border p-5 shadow-sm ${adminMapTone(tool.tool_status)}`}>
            <div className="text-xs font-black uppercase tracking-widest opacity-70">Primary</div>
            <h2 className="mt-2 text-2xl font-black">{tool.title}</h2>
            {tool.use_when ? <p className="mt-2 text-sm leading-6 opacity-80">{tool.use_when}</p> : null}
          </article>
        ))}
      </section>
    </main>
  );
}
