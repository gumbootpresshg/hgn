import Link from "next/link";
import { getBrandPolishSnapshot } from "@/lib/brand-polish";

export const dynamic = "force-dynamic";

export default async function BrandStatusPage() {
  const snapshot = await getBrandPolishSnapshot();
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-3xl border bg-white p-6 shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-hgnBlue">Brand status</p>
        <h1 className="mt-3 text-4xl font-black text-hgnNavy">Free, Independent, Local.</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          The launch tagline is short and direct, with no repeated place name under the Haida Gwaii News masthead.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Brand ready</p>
            <p className="mt-2 text-4xl font-black text-hgnNavy">{snapshot.score}%</p>
          </div>
          <div className="rounded-2xl border bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Blockers</p>
            <p className="mt-2 text-4xl font-black text-hgnBlue">{snapshot.blockers.length}</p>
          </div>
          <div className="rounded-2xl border bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Tagline</p>
            <p className="mt-2 text-xl font-black text-hgnNavy">{snapshot.tagline}</p>
          </div>
        </div>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-hgnBlue px-5 py-3 text-sm font-black uppercase tracking-widest text-white">
          View homepage
        </Link>
      </section>
    </main>
  );
}
