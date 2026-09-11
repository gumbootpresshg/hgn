import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchPublicEvents } from "@/lib/public-events";
import { formatEventDateOnly } from "@/lib/event-format";

export const dynamic = "force-dynamic";

export default async function IslandDailyPage() {
  const [{ data: daily }, { data: events }, { data: notices }, { data: marketplace }] = await Promise.all([
    supabase.from("daily_brief_items").select("*").eq("status", "active").order("priority", { ascending: false }).limit(12),
    fetchPublicEvents(supabase),
    supabase.from("notices").select("*").eq("status", "published").order("published_at", { ascending: false }).limit(6),
    supabase.from("marketplace_listings").select("*").eq("status", "published").order("published_at", { ascending: false }).limit(6),
  ]);

  const upcomingEvents = (events || []).slice(0, 6);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-3xl bg-hgnNavy p-8 text-white md:p-12">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-white/70">Island Daily</p>
        <h1 className="mt-2 text-4xl font-black md:text-6xl">What to check today</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-white/80">
          A quick daily board for news, events, notices, weather, marketplace items and community updates across Haida Gwaii.
        </p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {(daily || []).map((item: any) => (
          <Link key={item.id} href={item.href || "#"} className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md">
            <p className="text-xs font-black uppercase tracking-wide text-hgnBlue">{item.type || "Daily"}</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p>
          </Link>
        ))}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <Panel title="Upcoming events" href="/events" items={upcomingEvents} field="event_date" formatter={formatEventDateOnly} empty="No published events yet." />
        <Panel title="Notices" href="/notices" items={notices || []} field="town" empty="No published notices yet." />
        <Panel title="Marketplace" href="/marketplace" items={marketplace || []} field="price" empty="No marketplace listings yet." />
      </div>
    </main>
  );
}

function Panel({ title, href, items, field, empty, formatter }: { title: string; href: string; items: any[]; field: string; empty: string; formatter?: (item: any) => string }) {
  return (
    <section className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-xl font-black text-hgnNavy">{title}</h2>
        <Link href={href} className="text-sm font-black text-hgnBlue">View →</Link>
      </div>
      <div className="mt-4 grid gap-3">
        {!items.length && <p className="text-sm text-slate-500">{empty}</p>}
        {items.map((item) => (
          <Link key={item.id} href={href} className="rounded-xl bg-slate-50 p-4 hover:bg-slate-100">
            <h3 className="font-black text-slate-950">{item.title || item.name}</h3>
            {(formatter || item[field]) && <p className="mt-1 text-sm text-slate-500">{formatter ? formatter(item) : String(item[field])}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
