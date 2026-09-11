import Link from "next/link";
import { calendarTone, calendarToneClasses, getEditorialCalendarSnapshot } from "@/lib/editorial-calendar";

export const dynamic = "force-dynamic";

export default async function ComingUpPage() {
  const snapshot = await getEditorialCalendarSnapshot();
  const publicItems = snapshot.calendar.filter((item) => !["killed", "cancelled", "blocked"].includes(String(item.status || "").toLowerCase())).slice(0, 12);

  return <main className="mx-auto max-w-6xl px-4 py-10">
    <section className="rounded-3xl bg-hgnNavy p-8 text-white shadow-sm">
      <p className="text-sm font-black uppercase tracking-widest text-hgnGold">HGN beta</p>
      <h1 className="mt-2 text-5xl font-black">Coming up</h1>
      <p className="mt-4 max-w-3xl text-lg text-white/80">A lightweight public view of stories, explainers and community coverage being prepared during the HGN beta.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/newsletter" className="rounded-xl bg-white px-4 py-3 font-black text-hgnNavy">Get updates</Link><Link href="/submit-tip" className="rounded-xl border border-white/30 px-4 py-3 font-black text-white">Send a tip</Link></div>
    </section>

    <section className="mt-8 grid gap-4 md:grid-cols-2">{publicItems.map((item) => <article key={item.id} className={`rounded-2xl border p-5 shadow-sm ${calendarToneClasses(calendarTone(item.status))}`}><div className="text-xs font-black uppercase tracking-widest opacity-70">{item.publish_date} · {item.section} · {item.status}</div><h2 className="mt-2 text-2xl font-black">{item.title}</h2>{item.production_notes && <p className="mt-3 text-sm leading-6 opacity-80">{item.production_notes}</p>}<p className="mt-4 text-sm font-black opacity-80">{item.is_featured ? "Featured coverage" : "Planned coverage"}{item.is_beta_critical ? " · Beta priority" : ""}</p></article>)}{!publicItems.length && <div className="rounded-2xl border bg-white p-8 text-slate-700 md:col-span-2"><h2 className="text-2xl font-black text-hgnNavy">Nothing scheduled yet</h2><p className="mt-2">The newsroom calendar will appear here once upcoming beta coverage is planned.</p></div>}</section>
  </main>;
}
