import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchPublicEvents } from "@/lib/public-events";
import { formatEventDateTime } from "@/lib/event-format";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const [{ data: events }, { data: notices }, { data: obits }, { data: alerts }] = await Promise.all([
    fetchPublicEvents(supabase),
    supabase.from("notices").select("*").in("status", ["approved", "published"]).order("created_at", { ascending: false }).limit(5),
    supabase.from("obituaries").select("*").in("status", ["approved", "published"]).order("published_at", { ascending: false }).limit(4),
    supabase.from("daily_desk_items").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(5),
  ]);

  const upcomingEvents = (events || []).slice(0, 8);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-3xl bg-hgnNavy p-8 text-white">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-white/70">Daily Desk</p>
        <h1 className="mt-2 text-5xl font-black">Today on Haida Gwaii</h1>
        <p className="mt-3 max-w-3xl text-white/80">A quick morning check-in for events, notices, obituaries, map updates and useful community information.</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-3xl font-black text-hgnNavy">Upcoming Events</h2>
            <Link href="/events" className="rounded-full bg-hgnBlue px-4 py-2 text-sm font-bold text-white">Full calendar</Link>
          </div>
          <div className="mt-5 grid gap-4">
            {upcomingEvents.length ? upcomingEvents.map((event: any) => (
              <div key={event.id} className="rounded-xl border p-4">
                <div className="text-xs font-black uppercase text-hgnBlue">{event.community || event.town || event.category || "Community"}</div>
                <h3 className="mt-1 text-xl font-black text-slate-950">{event.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{formatEventDateTime(event)}</p>
                {event.description && <p className="mt-2 line-clamp-2 text-slate-700">{event.description}</p>}
              </div>
            )) : <p className="text-slate-600">No approved events yet. Submit one for editor review.</p>}
          </div>
        </section>

        <aside className="grid gap-6">
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-hgnNavy">Community Notes</h2>
            <div className="mt-4 grid gap-3">
              {alerts?.length ? alerts.map((item: any) => (
                <div key={item.id} className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-black uppercase text-slate-500">{item.item_type || "Note"}</div>
                  <p className="mt-1 font-bold text-slate-900">{item.title}</p>
                  {item.details && <p className="mt-1 text-sm text-slate-600">{item.details}</p>}
                </div>
              )) : <p className="text-sm text-slate-600">No desk items posted.</p>}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-hgnNavy">Notices & Obituaries</h2>
            <div className="mt-4 grid gap-2 text-sm">
              <Link href="/notices" className="font-bold text-hgnBlue">Read notices</Link>
              <Link href="/submit-notice" className="font-bold text-hgnBlue">Submit a notice</Link>
              <Link href="/obituaries" className="font-bold text-hgnBlue">Read obituaries</Link>
              <Link href="/submit-obituary" className="font-bold text-hgnBlue">Submit obituary information</Link>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
