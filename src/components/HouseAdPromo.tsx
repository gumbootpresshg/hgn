import Link from "next/link"

export default function HouseAdPromo({ compact = false }: { compact?: boolean }) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-slate-900 text-white shadow-sm">
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
            Advertise With Haida Gwaii News
          </p>
          <h2 className="mt-1 text-xl font-black tracking-tight">
            Reach local readers across Haida Gwaii.
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
            Promote your business while supporting free local journalism.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/advertise" className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-950">
            Advertise
          </Link>
          <Link href="/support" className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
            Support
          </Link>
        </div>
      </div>
    </section>
  )
}
