import Link from "next/link"

const foundations = [
  ["News and article reading", "Ready foundation", "Published articles, sections, images and SEO routes are live."],
  ["Events and community calendar", "Ready foundation", "Public events and event detail data are available."],
  ["Visitor guide and map", "In active polish", "Database-backed places, coordinates, source checks and Near Me are being strengthened."],
  ["Weather, tides and emergency feeds", "Ready foundation", "Public web routes exist; native caching and alert behaviour still need app-specific work."],
  ["Reader accounts", "Ready foundation", "Unified login and account areas exist."],
  ["Newsletter preferences", "Ready foundation", "Logged-in and token-based preference management is connected."],
  ["Marketplace", "Ready foundation", "Listings and account ownership exist; native posting flow needs device testing."],
  ["Push notifications", "Not started", "Requires Apple/Google credentials, device tokens and newsroom alert controls."],
  ["Offline mode", "Not started", "Requires a deliberate cache policy for news, guide places and emergency information."],
  ["App-store privacy and release package", "Not started", "Privacy disclosures, screenshots, icons, signing and store listings come after the data surface is stable."],
]

export default function AppReadinessPage() {
  return <main className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6">
    <header className="rounded-3xl border bg-slate-950 p-8 text-white"><p className="text-xs font-black uppercase tracking-[.18em] text-blue-300">iOS + Android runway</p><h1 className="mt-3 font-serif text-5xl font-bold">First app readiness</h1><p className="mt-3 max-w-3xl text-slate-300">The website remains the source of truth. The first apps should consume stable content, guide and account services rather than inventing a second newsroom behind the curtain.</p></header>
    <section className="grid gap-4 sm:grid-cols-3"><Link href="/admin/guide-keeper" className="rounded-2xl border bg-white p-5 hover:border-hgnBlue"><strong>1. Finish the Guide</strong><p className="mt-2 text-sm text-slate-600">Coordinates, official sources, freshness and useful place details.</p></Link><Link href="/admin/platform-map" className="rounded-2xl border bg-white p-5 hover:border-hgnBlue"><strong>2. Stabilize core tools</strong><p className="mt-2 text-sm text-slate-600">Keep one clear web workflow for each publishing task.</p></Link><Link href="/admin/settings" className="rounded-2xl border bg-white p-5 hover:border-hgnBlue"><strong>3. Prepare app services</strong><p className="mt-2 text-sm text-slate-600">Define push, offline, privacy and release settings.</p></Link></section>
    <section className="rounded-3xl border bg-white p-6"><h2 className="font-serif text-3xl font-bold">Foundation checklist</h2><div className="mt-5 grid gap-3">{foundations.map(([name,status,detail])=><article key={name} className="grid gap-2 rounded-xl border p-4 md:grid-cols-[1.2fr_.5fr_2fr] md:items-center"><strong>{name}</strong><span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${status === "Not started" ? "bg-amber-100 text-amber-900" : status === "In active polish" ? "bg-blue-100 text-blue-900" : "bg-emerald-100 text-emerald-900"}`}>{status}</span><p className="text-sm text-slate-600">{detail}</p></article>)}</div></section>
  </main>
}
